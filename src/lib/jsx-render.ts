import { propConfigs, PROP_TYPE, DefinePropTypeConfig } from "./props.js";
import { WebComponent } from "../classes/full.js";
import { Constructor } from "../classes/types.js";
import { CUSTOM_CSS_PROP_NAME } from "./base.js";
import { classNames } from "./shared.js";

function anyToString(value: any): string {
	if (typeof value === 'object' && 'toString' in value || value.toString) {
		return value.toString();
	}
	return value + '';
}

export class JSXInterpreted {
	public children: (JSXInterpreted|any)[];
	constructor(public tag: string|Constructor<any>, public attrs: {
		[key: string]: any;
	}|null, children: (JSXInterpreted|any)[], public root: {
		genRef?(value: any): string
	}) { 
		this.children = children.filter(c => c !== undefined);
	}

	toText(): string {
		return `<${this.tag} ${!this.attrs ? '' : Object.getOwnPropertyNames(this.attrs).map((attr) => {
			return `${attr}="${anyToString(this.attrs![attr as any])}"`;
		}).join(' ')}>
			${this.children.map((child) => {
				if (child instanceof JSXInterpreted) {
					return child.toText() ;
				}
				return anyToString(child);
			}).join('\n')}
		</${this.tag}>`
	}
}


declare global {
	namespace JSX {
		interface Element extends JSXInterpreted { }
	}
}

export function jsxInterpreter(root: {
	genRef?(value: any): string
}, tag: string|Constructor<any>, attrs: {
	[key: string]: any;
}|null, ...children: (JSXInterpreted|any)[]) {
	return new JSXInterpreted(tag, attrs, children, root);
}

const renderedMap: WeakMap<HTMLElement, JSXInterpreted> = new WeakMap();

function renderTextNode(text: any) {
	return document.createTextNode(text);
}

function addListener(el: HTMLElement|WebComponent<any, any>, name: string, value: any, isCustom: boolean) {
	// Custom listener
	if (eventListeners.has(el) && eventListeners.get(el)!.has(name)) {
		const lastFn = eventListeners.get(el)!.get(name)!;
		// Same functions, no need to change anything
		if (lastFn === value) return;
		// Remove previous one
		if (isCustom) {
			(el as WebComponent<any, any>).clearListener(name, eventListeners.get(el)!.get(name)! as any);
		} else {
			el.removeEventListener(name, eventListeners.get(el)!.get(name)! as any);
		}
	}
	// Add new one
	if (isCustom) {
		(el as WebComponent<any, any>).listen(name, value);
	} else {
		el.addEventListener(name, value);
	}
	if (!eventListeners.has(el)) eventListeners.set(el, new Map());
	eventListeners.get(el)!.set(name, value);
}

const eventListeners: WeakMap<HTMLElement|Constructor<any>, Map<string, Function>> = new WeakMap();
function handleSpecialNames(root: {
	genRef?(value: any): string
}, el: HTMLElement|any, 
	attr: string, value: any) {
		const prefix = attr[0];
		const name = attr.slice(1);
		if (prefix === '@') {
			if (attr[1] === '@') {
				// Custom listener
				addListener(el, name, value, true);
			} else {
				// Regular listener
				addListener(el, name, value, false);
			}
		} else if (prefix === '?') {
			// Boolean
			if (el.hasAttribute(name) === !!value) return;
			if (value) {
				el.setAttribute(name, '');
			} else {
				el.removeAttribute(name);
			}
		} else if (prefix === 'class') {
			// Class
			if (Array.isArray(value)) {
				el.setAttribute('class', classNames(...value));
			} else {
				el.setAttribute('class', classNames(value));
			}
		} else if (prefix === '#' || attr === CUSTOM_CSS_PROP_NAME) {
			// Ref
			if (!root.genRef) {
				throw new Error('Could not generate ref since the template-manager layer is not loaded');
			}
			el.setAttribute(prefix === '#' ? name : attr, 
				root.genRef(value));
		} else {
			return false;
		}
		return true;
	}

function setAttribute(root: {
	genRef?(value: any): string
}, el: HTMLElement|any, attr: string, value: any) {
	if (handleSpecialNames(root, el, attr, value)) return;
	if (!propConfigs.has(el as any)) {
		el.setAttribute(attr, value);
		return;
	}

	const { priv = {}, reflect = {} } = propConfigs.get(el as any)!;
	const props = {...priv, ...reflect};
	if (!(attr in props)) {
		el.setAttribute(attr, value);
		return;
	}
	const prop = props[attr];
	if (typeof prop === 'string') {
		// Simple PROP_TYPE
		if (prop === PROP_TYPE.BOOL) {
			if (el.hasAttribute(attr) === !!value) return;
			if (value) {
				el.setAttribute(attr, '');
			} else {
				el.removeAttribute(attr);
			}
		}
		return;
	}
	if (typeof prop === 'symbol' || typeof (prop as DefinePropTypeConfig).type === 'symbol') {
		// Complex type
		if (!root.genRef) {
			throw new Error('Could not generate ref since the template-manager layer is not loaded');
		}
		el.setAttribute(attr, root.genRef(value));
		return;
	}
	const config = prop as DefinePropTypeConfig;
	if (config.type === PROP_TYPE.BOOL) {
		if (el.hasAttribute(attr) === !!value) return;
		if (value) {
			el.setAttribute(attr, '');
		} else {
			el.removeAttribute(attr);
		}
		return;
	}
	if (attr === '__listeners') {
		for (const name in value as {
			[key: string]: Function;
		}) {
			addListener(el, name, value, false);
		}
		return;
	}
	if (attr === '___listeners') {
		for (const name in value as {
			[key: string]: Function;
		}) {
			addListener(el, name, value, true);
		}
		return;
	}
	el.setAttribute(attr, anyToString(value));
}

function renderFresh(descriptor: JSXInterpreted|any): HTMLElement|Text {
	if (!(descriptor instanceof JSXInterpreted)) {
		return renderTextNode(descriptor);
	}
	const { attrs, tag, children } = descriptor;
	const el = typeof tag === 'string' ? 
		document.createElement(tag) : 
		new tag();
	if (attrs) {
		for (const attr in attrs) {
			setAttribute(descriptor.root, el, attr, attrs[attr]);
		}
	}
	for (const child of children) {
		el.appendChild(renderFresh(child));
	}
	return el;
}

function renderToIndex(element: HTMLElement|Text, parent: HTMLElement, index: number) {
	if (parent.children[index]) {
		parent.children[index].remove();
	}
	if (!parent.children[index + 1]) {
		parent.appendChild(element);
	} else {
		parent.insertBefore(element, parent.children[index + 1]);
	}
}

function updateRender(currentRender: JSXInterpreted, lastRender: JSXInterpreted, parent: HTMLElement) {
	if (parent.children.length !== currentRender.children.length) {
		Array.from(parent.children).forEach(c => c.remove());
		currentRender.children.forEach(c => parent.appendChild(renderFresh(c)));
		return;
	}

	for (let i = 0; i < Math.min(currentRender.children.length, lastRender.children.length); i++) {
		const currentChild = currentRender.children[i];
		const lastChild = lastRender.children[i];

		if (!(currentChild instanceof JSXInterpreted)) {
			if (!(lastChild instanceof JSXInterpreted) || currentChild !== lastChild) {
				renderToIndex(renderTextNode(currentChild), parent, i);
			}
			continue;
		}

		// Check tag
		if (lastChild instanceof JSXInterpreted || currentChild.tag !== lastChild.tag) {
			// Big change, just do a fresh render
			renderToIndex(renderFresh(currentChild), parent, i);
			continue;
		}

		// Check attrs
		const element = parent.children[i] as HTMLElement;
		const currentAttrs = currentChild.attrs || {};
		const lastAttrs = lastChild.attrs || {};
		const joinedAttrs = {...currentAttrs, ...lastAttrs};
		for (const key in joinedAttrs) {
			if (!(key in currentAttrs)) {
				// Removed 
				element.removeAttribute(key);
			} else if (currentAttrs[key] !== lastAttrs[key] || !(key in lastAttrs)) {
				element.setAttribute(key, currentAttrs[key] + '');
			}
		}

		// Check children
		updateRender(currentChild, lastChild, element);
	}
	if (currentRender.children.length !== lastRender.children.length) {
		if (currentRender.children.length > lastRender.children.length) {
			currentRender.children.slice(lastRender.children.length).forEach(c => parent.appendChild(renderFresh(c)));
		} else {
			Array.from(parent.children).slice(currentRender.children.length).forEach(c => c.remove());
		}
	}
}

export function renderJSX(interpreted: JSXInterpreted, target: HTMLElement) {
	if (!renderedMap.has(target) || target.children.length !== 1) {
		Array.from(target.children).forEach(c => c.remove());
		target.appendChild(renderFresh(interpreted));
	} else {
		updateRender(
			new JSXInterpreted(target.tagName, null, [interpreted], interpreted.root), 
			new JSXInterpreted(target.tagName, null, [renderedMap.get(target)!], interpreted.root), 
			target);
	}
	renderedMap.set(target, interpreted);
}