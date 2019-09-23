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


import { utilNode } from '../../shared/types/types.electron';

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

    getHighlighted(st: string) {
        return this.prismJS.highlight(st, prism.languages.html, 'html');
    }
}
