import { Injectable } from '@angular/core';

import 'clipboard';

import * as prism from 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-scss';

import { Diff2Html } from 'diff2html';

import { utilNode } from '../../shared/types/types.electron';
import { DiffBlockLines, GitDiff, GitDiffBlocks } from '../../shared/model/GitDiff';
import { GitDiffState } from '../../shared/states/DATA/git-diff';
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

    async highlight() {
        prism.highlightAll();
        // return this.util.promisify(this.prismJS.highlightAll);
    }

    getHighlighted(st: string, langType: string = 'typescript') {
        const primsLangConfig = Grammar(langType);
        return this.prismJS.highlight(st, primsLangConfig.grammar, primsLangConfig.lang);
    }

    getDiffHTML(diffString: GitDiffState) {
        const diffJSON: GitDiff = Diff2Html.getJsonFromDiff(diffString.diff, {
            inputFormat: 'diff',
            showFiles: true,
            matching: 'lines'
        })[0];

        const lines: DiffBlockLines[] = this.retrieveHighlightContent(diffJSON.blocks[0].lines, diffJSON.language);

        const block: GitDiffBlocks = {
            header: diffJSON.blocks[0].header,
            lines: lines,
            newStartLine: diffJSON.blocks[0].newStartLine,
            oldStartLine: diffJSON.blocks[0].oldStartLine
        };

        const returnGitDiff: GitDiff = Object.assign({}, diffJSON, { blocks: [block] });
        return returnGitDiff;
    }

    retrieveHighlightContent(arrLines: DiffBlockLines[], lang: string) {
        let contentParsing = '';
        arrLines.forEach(line => {
            let content = line.content;
            if (content.indexOf('+') === 0 || content.indexOf('-') === 0) {
                // Remove prefix status
                content = ' ' + content.slice(1);
            }
            contentParsing += content + '\n';
        });
        // remove last \n
        contentParsing = contentParsing.slice(0, contentParsing.length - 1);
        const strTest = this.getHighlighted(contentParsing);
        const arrSplit = strTest.split('\n');

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
