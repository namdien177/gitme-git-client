import * as prism from 'prismjs';

import 'prismjs/components';

export async function Grammar(langType: string): Promise<GrammarInterface> {
    langType = fixingShortCall(langType);
    let grammar = null;
    if (langType) {
        switch (langType) {
            case 'html':
            case 'markup':
            case 'css':
            case 'scss':
            case 'json':
            case 'java':
            case 'javascript':
            case 'js':
            case 'typescript':
            case 'ts':
            case 'c':
                await import('prismjs/components/prism-' + langType);
                grammar = prism.languages[langType];
                break;
        }
    }

    return {
        lang: langType,
        grammar: grammar
    };
}

export interface GrammarInterface {
    lang: string;
    grammar: any;
}

function fixingShortCall(langShort: string) {
    if (langShort === 'ts') {
        return 'typescript';
    }

    if (langShort === 'html') {
        return 'markup';
    }

    return langShort;
}
