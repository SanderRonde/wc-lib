import { Constructor } from "../classes/types.js";
import { casingToDashes } from "./props.js";

type Listeners = {
	[key: string]: (this: any, event: Event) => any;
}

type Bools = {
	[key: string]: boolean;
}

type Refs = {
	[key: string]: any;
}

function convertSpecialAttrs(attrs: {
	[key: string]: any;
}|null) {
	if (!attrs) return attrs;

	const specialAttrs: {
		[key: string]: any;
	} & Partial<{
		__listeners: Listeners;
		"@": Listeners;
		__component_listeners: Listeners;
		"@@": Listeners;
		__bools: Bools;
		"?": Bools;
		__refs: Refs;
		"#": Refs;
	}> = attrs;
	
	if (specialAttrs.__listeners || specialAttrs['@']) {
		const specialProps: Listeners = {
			...specialAttrs.__listeners,
			...specialAttrs["@"]
		};
		for (const key in specialProps) {
			attrs[`@${key}`] = specialProps[key];
		}
		delete specialAttrs.__listeners;
		delete specialAttrs['@'];
	}
	if (specialAttrs.__component_listeners || specialAttrs['@@']) {
		const specialProps: Listeners = {
			...specialAttrs.__component_listeners,
			...specialAttrs["@@"]
		};
		for (const key in specialProps) {
			attrs[`@@${key}`] = specialProps[key];
		}
		delete specialAttrs.__component_listeners;
		delete specialAttrs['@@'];
	}
	if (specialAttrs.__bools || specialAttrs['?']) {
		const specialProps: Bools = {
			...specialAttrs.__bools,
			...specialAttrs["?"]
		};
		for (const key in specialProps) {
			attrs[`?${key}`] = specialProps[key];
		}
		delete specialAttrs.__bools;
		delete specialAttrs['?'];
	}
	if (specialAttrs.__refs || specialAttrs['#']) {
		const specialProps: Bools = {
			...specialAttrs.__refs,
			...specialAttrs["#"]
		};
		for (const key in specialProps) {
			attrs[`#${key}`] = specialProps[key];
		}
		delete specialAttrs.__refs;
		delete specialAttrs['#'];
	}
	return attrs;
}

/**
 * Converts JSX to a template-literal type representation
 * 
 * @template TR - The template result
 * 
 * @param {string|Constructor<any> & { is: string; }} tag - The tag
 * 	itself. Can either be a string or a class that can be constructed
 * @param {{ [key: string]: any; }|null} attrs - The attributes 
 * 	of this tag
 * @param {(TR|any[]} children - Child of this template. Either
 * 	a result of this function (so nested JSX templates) or
 * 	something else such as a value.
 * 
 * @returns {{ strings: TemplateStringsArray; values: any[]; }} A 
 * 	representation of the JSX element in template literal form
 */
export function jsxToLiteral<TR>(tag: string|Constructor<any> & {
	is: string;
}, attrs: {
	[key: string]: any;
}|null, ...children: (TR|any)[]): {
	strings: TemplateStringsArray;
	values: any[];
} {
	const tagName = typeof tag === 'string' ?
		tag : tag.is;
	const strings: string[] = [];
	const values: any[] = [];

	let openTagClosed: boolean = false;

	const newAttrs = convertSpecialAttrs(attrs);
	const hasAttrs = !!(newAttrs && Object.getOwnPropertyNames(newAttrs).length);
	const hasChildren = !!children.length;

	if (!hasAttrs && !hasChildren) {
		strings.push(`<${tagName}></${tagName}>`);
		const arr: Partial<TemplateStringsArray> = strings;
		(arr as any).raw = strings;
		return {
			strings: arr as TemplateStringsArray,
			values
		}
	}

	if (hasAttrs) {
		// There are some attributes
		let firstArg: boolean = true;
		for (const key in newAttrs) {
			const attrName = casingToDashes(key);
			if (firstArg) {
				strings.push(`<${tagName} ${attrName}="`);
				firstArg = false;
			} else {
				strings.push(`" ${attrName}="`);
			}
			values.push(newAttrs[key]);
		}
	} else {
		// No attributes, push just the tag
		strings.push(`<${tagName}>`);	
		openTagClosed = true;
	}

	if (hasChildren) {
		for (const child of children.slice(0, children.length - 1)) {
			if (!openTagClosed) {
				strings.push(`">`);
				openTagClosed = true;
			}
			strings.push('');
			values.push(child);
		}

		values.push(children[children.length - 1]);
		if (!openTagClosed) {
			strings.push(`">`);
			openTagClosed = true;
		}
		strings.push(`</${tagName}>`);
	} else {
		// The only way for openTagClosed
		// to be true is for hasAttrs to be
		// false. However, if !hasAttrs && !hasChildren
		// the function returns early

		// Push the remaining text
		strings.push(`"></${tagName}>`);
	}

	const arr: Partial<TemplateStringsArray> = strings;
	(arr as any).raw = strings;
	return {
		strings: arr as TemplateStringsArray,
		values
	}
}