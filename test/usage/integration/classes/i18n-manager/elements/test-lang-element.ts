import {
    TemplateFn,
    CHANGE_TYPE,
    config,
    ConfigurableWebComponent,
    SelectorMap,
    EventListenerObj,
} from '../../../../../../build/es/wc-lib.js';
import {
    render,
    html,
    directive,
    Part,
} from '../../../../../../node_modules/lit-html/lit-html.js';
import type { RenderableComponent } from '../../../../../types/test-types.js';

const awaitPromise = directive(
    (key: string, value: Promise<any> | string) => (part: Part) => {
        if (typeof value === 'string') {
            part.setValue(value);
            part.commit();
            return;
        }
        part.setValue(`{{${key}}}`);
        value.then((str) => {
            part.setValue(str);
            part.commit();
        });
    }
);

const placeholder = directive(
    (key: string, value: Promise<any> | string) => (part: Part) => {
        if (typeof value === 'string') {
            part.setValue(value);
            part.commit();
            return;
        }
        part.setValue(`{{${key}}}`);
        part.commit();
        value.then((str) => {
            part.setValue(str);
            part.commit();
        });
    }
);

export declare class LangElement extends ConfigurableWebComponent<{
    langs: 'en' | 'nl';
    i18n: {
        test: string;
        nonexistent: string;
        values: string;
    };
}> {}

declare class RenderableLangComponent<
    GA extends {
        i18n?: any;
        langs?: string;
        events?: EventListenerObj;
        themes?: {
            [key: string]: any;
        };
        selectors?: SelectorMap;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        };
        subtreeProps?: {
            [key: string]: any;
        };
    } = {}
> extends RenderableComponent<GA> {
    __prom(...strings: any[]): any;
    __(...strings: any[]): any;
}

export const LangElementFactory = (superFn: typeof RenderableLangComponent) => {
    @config({
        is: 'lang-element',
        html: new TemplateFn<_LangElement>(
            function () {
                return html`
                    <div id="placeholdertest">
                        ${placeholder('test', this.__prom('test'))}
                    </div>
                    <div id="promiseTest">
                        ${awaitPromise('test', this.__prom('test'))}
                    </div>
                    <div id="returnerTest">${this.__('test')}</div>
                    <div id="nonexistent">
                        ${placeholder(
                            'nonexistent',
                            this.__prom('nonexistent')
                        )}
                    </div>

                    <div id="returnerValues">
                        ${this.__('values', '1', '2', '3')}
                    </div>
                    <div id="placeholderValues">
                        ${placeholder(
                            'values',
                            this.__prom('values', '1', '2', '3')
                        )}
                    </div>

                    <div id="msgAsValue">
                        ${this.__(
                            'values',
                            this.__prom('test'),
                            '2',
                            this.__prom('test')
                        )}
                    </div>
                `;
            },
            CHANGE_TYPE.LANG,
            render
        ),
        css: null,
    })
    class _LangElement extends superFn<{
        langs: 'en' | 'nl';
        i18n: {
            test: string;
            nonexistent: string;
            values: string;
        };
    }> {}
    return (_LangElement as unknown) as typeof LangElement;
};
