import {
    ConfigurableWebComponent,
    config,
    TemplateFn,
    CHANGE_TYPE,
} from '../modules/wc-lib/wc-lib.js';
import { render } from '../modules/lit-html/lit-html.js';
import { I18nComponentHTML } from './i18n-component.html.js';
import { LangFile } from './index.js';

@config({
    is: 'i18n-component',
    css: new TemplateFn<I18nComponent>(
        (html) => {
            return html`
                <style>
                    button,
                    #input {
                        display: inline-block;
                    }
                </style>
            `;
        },
        CHANGE_TYPE.NEVER,
        render
    ),
    html: I18nComponentHTML,
})
export class I18nComponent extends ConfigurableWebComponent<{
    langs: 'en' | 'de' | 'es';
    i18n: LangFile;
}> {}
