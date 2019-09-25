import * as prism from 'prismjs';

export function Grammar(langType: string): GrammarInterface {
    let grammar = null;
    switch (langType) {
        case 'typescript':
        case 'ts':
            grammar = prism.languages.typescript;
            break;
        case 'html':
            grammar = prism.languages.html;
            break;
        case 'css':
            grammar = prism.languages.css;
            break;
        case 'scss':
            grammar = prism.languages.scss;
            break;
        case 'json':
            grammar = prism.languages.json;
            break;
    }

    return {
        lang: langType,
        grammar: grammar
    };
}

export interface GrammarInterface {
    lang: string;
    grammar: any
}
