import { Injectable } from '@angular/core';

import 'clipboard';

import * as prism from 'prismjs';


import { Diff2Html } from 'diff2html';

import { utilNode } from '../../shared/types/types.electron';
import { DiffBlockLines, GitDiff, GitDiffBlocks } from '../../shared/model/GitDiff';
import { Grammar } from '../../shared/types/grammar.define';

@Injectable({
    providedIn: 'root'
})
export class CodeHighlightService {

    private readonly prismJS: typeof prism;

    private readonly util: typeof utilNode;

    constructor() {
        this.prismJS = prism;
        this.util = utilNode;
    }

    async getHighlighted(st: string, langType: string = 'typescript') {
        const prismLangConfig = await Grammar(langType);
        return this.prismJS.highlight(st, prismLangConfig.grammar, prismLangConfig.lang);
    }

    async getDiffHTML(diffString: string) {
        const diffJSONAllBlock: GitDiff = await Diff2Html.getJsonFromDiff(diffString, {
            inputFormat: 'diff',
            showFiles: true,
            matching: 'lines'
        })[0]; // single view mode

        const blocksCode: GitDiffBlocks[] = [];
        const blocksCodeRaw: GitDiffBlocks[] = diffJSONAllBlock.blocks;
        for (const blockDiff of blocksCodeRaw) {
            const lines: DiffBlockLines[] = await this.retrieveHighlightContent(blockDiff.lines, diffJSONAllBlock.language);
            const block: GitDiffBlocks = {
                header: blockDiff.header,
                lines: lines,
                newStartLine: blockDiff.newStartLine,
                oldStartLine: blockDiff.oldStartLine
            };
            blocksCode.push(block);
        }

        const returnGitDiff: GitDiff = Object.assign({}, diffJSONAllBlock, { blocks: blocksCode });
        return returnGitDiff;
    }

    async retrieveHighlightContent(arrLines: DiffBlockLines[], lang: string) {
        let contentParsing = '';
        let smallestSpace = -1;
        arrLines.forEach((line, index) => {
            let content = line.content;

            if (content.indexOf('+') === 0 || content.indexOf('-') === 0) {
                // Remove prefix status
                content = ' ' + content.slice(1);
            }
            const firstNonSpaceChar = content.search(/\S/);

            if (smallestSpace === -1) {
                smallestSpace = firstNonSpaceChar;
            }
            if (firstNonSpaceChar > -1) {
                if (smallestSpace > firstNonSpaceChar) {
                    smallestSpace = firstNonSpaceChar;
                }
            }
            contentParsing += content + '\n';
        });
        // remove last \n
        contentParsing = contentParsing.slice(0, contentParsing.length - 1);

        const strTest = await this.getHighlighted(contentParsing, lang);
        const arrSplit = strTest.split('\n').map(
            row => row.slice(smallestSpace)
        );

        const lines: DiffBlockLines[] = [];

        arrSplit.forEach((rowHighlighted, index) => {
            lines.push({
                content: rowHighlighted,
                newNumber: arrLines[index].newNumber,
                oldNumber: arrLines[index].oldNumber,
                type: arrLines[index].type,
            });
        });

        return lines;
    }
}
