import { I18nComponent } from "./i18n-component.js";
import { WebComponent } from "../../src/wclib.js";
import { 
	directive, Part, 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange  
} from "../../node_modules/lit-html/lit-html.js";

// This format is completely up to you as it uses your
// getMessage function to return a value. Common
// formats include string-only values (if no extra data
// can be passed) or something like the one chrome uses
// https://developer.chrome.com/apps/i18n-messages
type MessageEntry = {
	defaultValue: string;
	replaceable?: boolean;
}[];

// A key-value map that represents your language file.
// This is only really used for typing
export interface LangFile {
	what_is_your_name: MessageEntry;
	my_name_is: MessageEntry;
	set_lang_to: MessageEntry;
	english: MessageEntry;
	german: MessageEntry;
	spanish: MessageEntry;
}

WebComponent.initI18N({
	urlFormat: './json-files/$LANG$.json',
	defaultLang: 'en',
	// Optional. Combined with lit-html this
	// sets the value to a placeholder while the
	// language file is loading
	returner: directive((promise: Promise<any>, placeholder: string) => ((part: Part) => {
		part.setValue(placeholder);
		promise.then((str) => {
			part.setValue(str);
			part.commit();
		});
	})),
	// A function that is called when this.__ is called.
	// This should return the I18N value given a file, a key
	// and some optional values
	async getMessage(langFile: LangFile, key: string, values: any[]) {
		if (!(key in langFile)) {
			return '???';
		}

		// If there are any promises in the passed values, wait for
		// them to resolve
		values = await Promise.all(values);
		
		// Get the relevant entry
		const item = langFile[key as keyof typeof langFile];

		let valueIndex: number = 0;

		let result: string = '';
		for (const { defaultValue, replaceable } of item) {
			if (!replaceable || values[valueIndex] === void 0) {
				result += defaultValue;
			} else {
				result += values[valueIndex];
				valueIndex++;
			}
		}
		
		return result;
	}
});
WebComponent.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});

I18nComponent.define();