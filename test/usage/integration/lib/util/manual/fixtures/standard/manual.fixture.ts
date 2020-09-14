import { Part } from 'lit-html';
import { WebComponent } from '../../../../../../../../build/es/wc-lib.js';
import { TestElement } from '../../../../../classes/elements/test-element.js';
import { LangElementFactory } from '../../../../../classes/i18n-manager/elements/test-lang-element.js';
import { ThemedElementFactory } from '../../../../../classes/theme-manager/elements/themed-element.js';
import { DeepWatchable } from '../../elements/deep-watchable.js';

DeepWatchable.define(true);
TestElement.define(true);
ThemedElementFactory(WebComponent as any).ThemedElement.define(true);
LangElementFactory(WebComponent as any).define(true);

class DirectiveCapturer {
    private _uncommittedValue: any;
    private _currentValue: any;

    constructor(
        public fn: (...args: any[]) => (part: Part) => void,
        ...args: any[]
    ) {
        fn(...args)({
            commit: () => {
                this._currentValue = this._uncommittedValue;
            },
            setValue: (value: any) => {
                this._uncommittedValue = value;
            },
            value: null,
        });
    }

    get currentValue() {
        return this._currentValue;
    }

    get tempValue() {
        return this._uncommittedValue;
    }
}

const directiveFn = ((fn: any) => (...args: any[]) =>
    new DirectiveCapturer(fn, ...args)) as any;

WebComponent.initI18N({
    returner: directiveFn(
        (
            promise: Promise<any>,
            placeholder: string,
            onChange: (
                listener: (promise: Promise<string>, content: string) => void
            ) => void
        ) => (part: Part) => {
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
        }
    ),
    defaultLang: 'en',
    langFiles: {
        en: {
            test: 'test',
            nonexistent: 'nonexistent',
            values: 'values',
        },
        nl: {
            test: 'test2',
            nonexistent: 'nonexistent2',
            values: 'values2',
        },
    },
});
const theme = {
    // Theme can contain any values that are valid in CSS
    first: {
        color1: 'rgb(255, 0, 0)',
        color2: 'rgb(0, 255, 255)',
    },
    second: {
        color1: 'rgb(0, 255, 0)',
        color2: 'rgb(255, 0, 255)',
    },
    third: {
        color1: 'rgb(0, 0, 255)',
        color2: 'rgb(255, 255, 0)',
    },
};

WebComponent.initTheme({
    theme: theme,
    defaultTheme: 'first',
});
