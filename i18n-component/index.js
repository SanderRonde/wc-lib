var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { I18nComponent } from './i18n-component.js';
import { WebComponent } from '../modules/wc-lib/wc-lib.js';
import { directive, TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart, AttributeCommitter, NodePart, isDirective, noChange, } from '../modules/lit-html/lit-html.js';
WebComponent.initI18N({
    urlFormat: './json-files/$LANG$.json',
    defaultLang: 'en',
    // Optional. Combined with lit-html this
    // sets the value to a placeholder while the
    // language file is loading
    returner: directive((promise, placeholder) => (part) => {
        part.setValue(placeholder);
        promise.then((str) => {
            part.setValue(str);
            part.commit();
        });
    }),
    // A function that is called when this.__ is called.
    // This should return the I18N value given a file, a key
    // and some optional values
    getMessage(langFile, key, values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(key in langFile)) {
                return '???';
            }
            // If there are any promises in the passed values, wait for
            // them to resolve
            values = yield Promise.all(values);
            // Get the relevant entry
            const item = langFile[key];
            let valueIndex = 0;
            let result = '';
            for (const { defaultValue, replaceable } of item) {
                if (!replaceable || values[valueIndex] === void 0) {
                    result += defaultValue;
                }
                else {
                    result += values[valueIndex];
                    valueIndex++;
                }
            }
            return result;
        });
    },
});
WebComponent.initComplexTemplateProvider({
    TemplateResult,
    PropertyCommitter,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    isDirective,
    noChange,
});
I18nComponent.define();
