import { TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart, AttributeCommitter, NodePart, isDirective, noChange, directive, } from '../modules/lit-html-bundled/lit-html.js';
import { WebComponent } from '../modules/wc-lib/wc-lib.js';
import { TicTacToe } from './tic-tac-toe-manual.js';
import { theme } from './theme.js';
function getLocalStorage(name) {
    if (typeof localStorage === 'undefined')
        return null;
    return localStorage.getItem(name);
}
WebComponent.initComplexTemplateProvider({
    TemplateResult,
    PropertyCommitter,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    isDirective,
    directive,
    noChange,
});
WebComponent.initTheme({
    theme: theme,
    defaultTheme: getLocalStorage('theme') ||
        (typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'),
});
WebComponent.initI18N({
    urlFormat: './i18n/$LANG$.json',
    defaultLang: getLocalStorage('lang') || 'en',
    // Optional. Combined with lit-html this
    // sets the value to a placeholder while the
    // language file is loading
    returner: directive((promise, placeholder, onChange) => (part) => {
        part.setValue(placeholder);
        promise.then((str) => {
            part.setValue(str);
            part.commit();
            onChange((newPromise) => {
                newPromise.then((newValue) => {
                    part.setValue(newValue);
                    part.commit();
                });
            });
        });
    }),
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
    },
});
TicTacToe.define();
