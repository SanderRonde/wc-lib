import { TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart, AttributeCommitter, NodePart, isDirective, noChange, directive } from "../modules/lit-html/lit-html.js";
import { WebComponent } from "../modules/wc-lib/wc-lib.js";
import { TicTacToe } from './tic-tac-toe.js';
export const theme = {
    light: {
        background: 'rgb(222, 222, 222)',
        primary: 'rgb(3, 169, 244)',
        text: 'rgb(21, 21, 21)'
    },
    dark: {
        background: 'rgb(21, 21, 21)',
        primary: 'yellow',
        text: 'rgb(218, 218, 218)'
    }
};
WebComponent.initComplexTemplateProvider({
    TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart,
    AttributeCommitter, NodePart, isDirective, noChange
});
WebComponent.initTheme({
    theme: theme,
    defaultTheme: localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ?
            'dark' : 'light')
});
WebComponent.initI18N({
    urlFormat: './i18n/$LANG$.json',
    defaultLang: localStorage.getItem('lang') || 'en',
    // Optional. Combined with lit-html this
    // sets the value to a placeholder while the
    // language file is loading
    returner: directive((promise, placeholder) => ((part) => {
        part.setValue(placeholder);
        promise.then((str) => {
            part.setValue(str);
            part.commit();
        });
    })),
    getMessage(langFile, key, values) {
        if (!(key in langFile))
            return '???';
        const value = langFile[key];
        if (!values.length)
            return value;
        let str = value;
        for (const value of values) {
            str = str.replace(/\$(\w*)\$/, value);
        }
        return str;
    }
});
TicTacToe.define();
