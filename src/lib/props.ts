import { CHANGE_TYPE } from './template-fn.js';

/**
 * The prefix used for complex references
 * 
 * @constant
 */
export const refPrefix = '___complex_ref';

function getterWithVal<R>(component: {
	getParentRef?(ref: string): any;
}, value: string|null, strict: boolean, type: 'string'|'number'|'bool'|typeof complex): boolean|string|number|undefined|R;
function getterWithVal(component: {
	getParentRef?(ref: string): any;
}, value: string|null, strict: boolean, type: 'bool'): boolean;
function getterWithVal(component: {
	getParentRef?(ref: string): any;
}, value: string|null, strict: boolean, type: 'string'): string|undefined;
function getterWithVal(component: {
	getParentRef?(ref: string): any;
}, value: string|null, strict: boolean, type: 'number'): number|undefined;
function getterWithVal<R>(component: {
	getParentRef?(ref: string): any;
}, value: string|null, strict: boolean, type: typeof complex): R|undefined;
function getterWithVal<R>(component: {
	getParentRef?(ref: string): any;
}, value: string|null, strict: boolean, type: 'string'|'number'|'bool'|typeof complex): boolean|string|number|undefined|R {
	if (type === 'bool') {
		if (strict) {
			return (value + '') === 'true';
		}
		return value !== undefined && value !== null && value !== 'false';
	} else {
		/* istanbul ignore else */
		if (value !== undefined && value !== null && value !== 'false') {
			if (type === 'number') {
				return ~~value;
			} else if (type === complex) {
				if (value.startsWith(refPrefix)) {
					/* istanbul ignore else */
					if (component.getParentRef) {
						return component.getParentRef(value);
					}
					/* istanbul ignore next */
					return value;
				} else {
					try {
						return JSON.parse(decodeURIComponent(value));
					} catch(e) {
						console.warn('Failed to parse complex JSON value', decodeURIComponent(value));
						return undefined;
					}
				}
			}
			return value;
		}
		/* istanbul ignore next */
		return undefined;
	}
}

/**
 * Gets the property with name `name`
 * from `element`
 * 
 * @template R - The return value
 * 
 * @param {HTMLElementAttributes & { getParentRef(ref: string): any; }} element - The	
 * 	element of which to get the property
 * @param {string} name - The name of the property
 * @param {boolean} strict - Whether to use strict mode.
 * 	If true, boolean type values are only true
 * 	if the value is 'true', not just any truthy value
 * @param {'string'|'number'|'bool'|typeof complex} type - The
 * 	type of the value
 * 
 * @returns {boolean|string|number|undefined|R} The value
 */
export function getter<R>(element: HTMLElementAttributes & {
	getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: 'string'|'number'|'bool'|typeof complex): boolean|string|number|undefined|R;
export function getter(element: HTMLElementAttributes & {
	getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: 'bool'): boolean;
export function getter(element: HTMLElementAttributes & {
	getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: 'string'): string|undefined;
export function getter(element: HTMLElementAttributes & {
	getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: 'number'): number|undefined;
export function getter<R>(element: HTMLElementAttributes & {
	getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: typeof complex): R|undefined;
export function getter<R>(element: HTMLElementAttributes & {
	getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: 'string'|'number'|'bool'|typeof complex): boolean|string|number|undefined|R {
	return getterWithVal(element, element.getAttribute(name), strict, type);
}

/**
 * Sets the attribute with name `name`
 * to `value`
 * 
 * @param {(key: string, val: string) => void} setAttrFn - The
 * 	original `element.setAttribute` function
 * @param {(key: string) => void, name: string} removeAttrFn - The
 * 	original `element.removeAttribute` function
 * @param {string} name - The name of the property
 * @param {string|boolean|number} value - The value to
 * 	set it to
 * @param {'string'|'number'|'bool'|typeof complex} type - The
 * 	type of the value
 */
export function setter(setAttrFn: (key: string, val: string) => void, 
	removeAttrFn: (key: string) => void, name: string, 
	value: string|boolean|number, type: 'string'|'number'|'bool'|typeof complex): void;
export function setter(setAttrFn: (key: string, val: string) => void, 
	removeAttrFn: (key: string) => void, name: string, 
	value: any, type: typeof complex): void;
export function setter(setAttrFn: (key: string, val: string) => void, 
	removeAttrFn: (key: string) => void, name: string, 
	value: boolean, type: 'bool'): void;
export function setter(setAttrFn: (key: string, val: string) => void, 
	removeAttrFn: (key: string) => void, name: string, 
	value: string, type: 'string'): void;
export function setter(setAttrFn: (key: string, val: string) => void, 
	removeAttrFn: (key: string) => void, name: string, 
	value: number, type: 'number'): void;
export function setter(setAttrFn: (key: string, val: string) => void, 
	removeAttrFn: (key: string) => void, name: string, 
	value: string|boolean|number, type: 'string'|'number'|'bool'|typeof complex): void {
		if (type === 'bool') {
			const boolVal = value as boolean;
			if (boolVal) {
				setAttrFn(name, '');
			} else {
				removeAttrFn(name);
			}
		} else {
			const strVal = value as string|number;
			if (type === complex) {
				try {
					setAttrFn(name, encodeURIComponent(JSON.stringify(strVal)));
				} catch(e) {
					// istanbul ignore next
					setAttrFn(name, encodeURIComponent('_'));
				}
			} else {
				setAttrFn(name, `${strVal}`);
			}
		}
	}

interface ExactTypeHaver {
	exactType: any;
}

interface Coerced {
	coerce: true;
}

type PreDefined = {
	value: any;
}|{
	defaultValue: any;
}

type IsUnassigned<V extends PROP_TYPE|ComplexType<any>|DefinePropTypeConfig> = 
	V extends PROP_TYPE.BOOL ? true : 
	V extends PROP_TYPE.NUMBER ? true : 
	V extends PROP_TYPE.STRING ? true : 
	V extends ComplexType<any> ? true : 
	V extends DefineTypeConfig ? 
		V extends ExactTypeHaver ? false :
			V['type'] extends PROP_TYPE.BOOL ? 
				V extends Coerced ? false : 
					V extends PreDefined ? false : true : 
			V['type'] extends PROP_TYPE.NUMBER ? 
				V extends Coerced ? false : 
					V extends PreDefined ? false : true : 
			V['type'] extends PROP_TYPE.STRING ? 
				V extends Coerced ? false : 
					V extends PreDefined ? false :true : 
			V['type'] extends ComplexType<any> ? 
				V extends PreDefined ? false : true :
					false : false;

type GetTSType<V extends PROP_TYPE|ComplexType<any>|DefinePropTypeConfig> = 
	V extends PROP_TYPE.BOOL ? boolean : 
	V extends PROP_TYPE.NUMBER ? number : 
	V extends PROP_TYPE.STRING ? string : 
	V extends ComplexType<infer R> ? R : 
	V extends DefineTypeConfig ? 
		V extends ExactTypeHaver ? V['exactType'] :
			V['type'] extends PROP_TYPE.BOOL ? 
				V extends Coerced ? boolean : 
					V extends PreDefined ? boolean : boolean : 
			V['type'] extends PROP_TYPE.NUMBER ? 
				V extends Coerced ? number : 
					V extends PreDefined ? number : number : 
			V['type'] extends PROP_TYPE.STRING ? 
				V extends Coerced ? string : 
					V extends PreDefined ? string :string : 
			V['type'] extends ComplexType<infer R> ? 
				V extends PreDefined ? R : R :
					void : void;

/**
 * Basic property types for properties
 */
export const enum PROP_TYPE {
	/**
	 * A string
	 */
	STRING = 'string',
	/**
	 * A number
	 */
	NUMBER = 'number',
	/**
	 * A boolean
	 */
	BOOL = 'bool'
}

/**
 * A complex type for a property where the passed
 * template value is the actual type
 */
export type ComplexType<T> = typeof complex & {
	__data: T;
};

const complex = Symbol('complex type');

/**
 * A complex type value. This will be typed
 * as whatever is passed as a template 
 * parameter to this function
 * 
 * @template T - The type to set it to
 * 
 * @returns {Symbol} A symbol representing
 * 	complex types
 */
export function ComplexType<T>(): ComplexType<T> {
	return complex as ComplexType<T>;
}

type DefinePropTypes = PROP_TYPE|ComplexType<any>;
interface DefineTypeConfig {
	/**
	 * The type of this property. Can either by a PROP_TYPE:
	 * PROP_TYPE.STRING, PROP_TYPE.NUMBER or PROP_TYPE.BOOL
	 * or it can be a complex type passed through ComplexType<TYPE>().
	 * ComplexType should be used for any values that do not fit 
	 * the regular prop type
	 */
	type: DefinePropTypes;
}

/**
 * The type of a property's config object
 */
export interface DefinePropTypeConfig extends DefineTypeConfig {
	/**
	 * Watch this property for changes. In objects, setting this to true
	 * means that any of its keys are watched for changes (see watchProperties)
	 *
	 * NOTE: This uses Proxy to watch objects. This does mean that
	 * after setting this property to an object, getting that same
	 * property will return a proxy of it (which is not strictly equal)
	 * If you do not want this or have environments that do not yet
	 * support window.Proxy, turn this off for objects
	 */
	watch?: boolean;
	/**
	 * The default value of this component. Should be of the same
	 * type as this prop's value (obviously). Will be undefined if not set
	 */
	defaultValue?: GetTSType<this['type']>;
	/**
	 * A synonym for defaultValue
	 */
	value?: GetTSType<this['type']>;
	/**
	 * The properties to watch if this is an object. These can contain
	 * asterisks and can go multiple properties deep. ** will watch any
	 * properties, even newly defined ones.
	 * For example: 
	 * 	['x'] only watched property x,
	 *  ['*.y'] watches the y property of any object values in this object
	 *  ['z.*'] watches any property of the z object
	 */
	watchProperties?: string[];
	/**
 	 * The exact type of this property. This is not actually used and
	 * is only used for typing.
	 * Say you have a property that can have the values 'text', 'password'
	 * or 'tel' (such as the html input element). This would mean that
	 * the type is a string (PROP_TYPE.STRING). This does however not fully
	 * express the restrictions. Doing
	 * { type: PROP_TYPE.STRING, exactType: '' as 'text'|'password'|'tel' }
	 * Will apply these restrictions and set the type accordingly
	 */
	exactType?: any;
	/**
	 * Coerces the value to given type if its value is falsy.
	 * String values are coerced to '', bools are coerced to false
	 * and numbers are coerced to 0
	 */
	coerce?: boolean;
	/**
	 * Only relevant for type=PROP_TYPE.BOOL
	 * This only sets a boolean value to true if the property was set to
	 * the string "true". Normally any string that is not equal
	 * to the string "false" will be taken as a true value.
	 * 	 * For example, if strict=false
	 * <my-component bool_1="a" bool_2="false" bool_3="" bool_4="true">
	 * bool_1, bool_3 and bool_4 are true while bool_2 is false (and any
	 * other bools are false as well since no value was supplied)
	 * 	 * For example, if strict=true
	 * <my-component bool_1="a" bool_2="false" bool_3="" bool_4="true">
	 * bool_4 is true and the rest is false
	 */
	strict?: boolean;
	/**
	 * Whether to reflect this property to the component itself.
	 * For example, if set to true and the property is called "value",
	 * accessing component.value will return the value of that property.
	 */
	reflectToSelf?: boolean;
}

function getDefinePropConfig(value: DefinePropTypes|DefinePropTypeConfig): DefinePropTypeConfig {
	if (typeof value === 'object' && 'type' in value) {
		const data = value as DefinePropTypeConfig;
		return data;
	} else {
		return {
			coerce: false,
			watch: true,
			strict: false,
			reflectToSelf: true,
			type: value as DefinePropTypes
		}
	}
}

namespace Watching {
	type PathLevel = Map<string|'*'|'**', {
		name: string|'*'|'**';
		relevantPaths: string[][];
		map: PathLevel;
		watchCurrent: boolean;
	}>;

	function genProxyStructureLevel(pathParts: string[][]): PathLevel {
		const currentLevel: PathLevel = new Map();
		for (const path of pathParts) {
			if (!currentLevel.has(path[0])) {
				currentLevel.set(path[0], {
					name: path[0],
					relevantPaths: [],
					watchCurrent: path.length === 1,
					map: new Map()
				});
			}
			currentLevel.get(path[0])!.relevantPaths.push(...pathParts);
		}

		/**
		 * With inputs x.y and *.y and *.x.y and z.z
		 * this now gives
		 * Map{
		 * 	x: { name: 'x', relevantPaths: ['x.y'], map: Map() }		
		 *  *: { name: '*', relevantPaths: ['*.y', '*.x.y'], map: Map() }
		 *  z: { name: 'z', relevantPaths: ['z.z'], map: Map() }
		 * }
		 */

		// Now merge the * relevantPaths into others
		for (const [ name, level ] of currentLevel) {
			if (name === '*') {
				// Merge this level's paths into others' paths
				for (const otherLevel of currentLevel.values()) {
					if (otherLevel.map === level.map) continue;

					otherLevel.relevantPaths.push(...level.relevantPaths);
				}
			}
		}

		// Dedupe the relevant paths
		for (const [ , level ] of currentLevel) {
			level.relevantPaths = level.relevantPaths.filter((val, index) => {
				return level.relevantPaths.indexOf(val) === index
			});
		}

		/**
		 * With inputs x.y and *.y and *.x.y and z.z
		 * this now gives
		 * Map{
		 *	x: { name: 'x', relevantPaths: ['x.y', '*.y', '*.x.y'], map: Map() }		
		 *  *: { name: '*', relevantPaths: ['*.y', '*.x.y'], map: Map() }
		 *  z: { name: 'z', relevantPaths: ['z.z', '*.y', '*.x.y'], map: Map() }
		 * }
		 */

		for (const [ , level ] of currentLevel) {
			level.map = genProxyStructureLevel(
				level.relevantPaths.map(p => p.slice(1))
					.filter(p => p.length));
		}

		return currentLevel;
	}

	function getProxyStructure(paths: string[]): PathLevel {
		const pathParts = paths.map(p => p.split('.'));

		for (const path of pathParts) {
			for (const pathPart of path) {
				if (pathPart === '**') {
					const retMap = new Map();
					retMap.set('**', {
						name: '**',
						map: new Map()
					});
					return retMap;
				}
			}
		}

		return genProxyStructureLevel(pathParts);
	}

	function createDeepProxy(obj: any, onAccessed: () => void) {
		const isArr = Array.isArray(obj);

		const proxy = new Proxy(obj, {
			set(_obj, prop, value) {
				const isPropChange = (() => {
					if (isArr) {
						if (typeof prop === 'symbol') return true;
						if (typeof prop === 'number' || !Number.isNaN(parseInt(prop))) {
							return true;
						}
						return false;
					} else {
						return true;
					}
				})();

				if (isPropChange) {
					if (typeof value === 'object' && value !== null) {
						value = createDeepProxy(value, onAccessed);
					}
					const oldValue = obj[prop];
					obj[prop] = value;
					if (oldValue !== value) {
						onAccessed();
					}
				} else {
					obj[prop] = value;
				}
				return true;
			},
			deleteProperty(_obj, prop) {
				if (Reflect.has(obj, prop)) {
					const deleted = Reflect.deleteProperty(obj, prop);
					onAccessed();
					return deleted;
				}
				return true;
			}
		});
		for (const key of Object.keys(obj)) {
			if (typeof obj[key] === 'object') {
				obj[key] = createDeepProxy(obj[key], onAccessed);
			}
		}
		return proxy;
	}

	function watchObjectLevel(obj: any, level: PathLevel, onAccessed: () => void) {
		if (!obj) return obj;

		const isArr = Array.isArray(obj);

		const proxy = new Proxy(obj, {
			set(_obj, prop, value) {
				const isPropChange = (() => {
					if (isArr) {
						if (level.has('*')) {
							if (typeof prop === 'symbol') return true;
							return typeof prop === 'number' || !Number.isNaN(parseInt(prop));
						}
						if (typeof prop !== 'symbol' && level.has(prop + '') && 
							level.get(prop + '')!.watchCurrent) {
								return true;
							}
						return false;
					} else {
						if (typeof prop !== 'symbol') {
							return ((level.get(prop + '') && level.get(prop + '')!.watchCurrent) ||
								(level.get('*') && level.get('*')!.watchCurrent));
						} 
						return level.has('*') && level.get('*')!.watchCurrent;
					}
				})();
				if (isPropChange) {
					const nextLevel = (typeof prop !== 'symbol' && level.get(prop + '')) ||
						level.get('*')!;

					if (nextLevel.map.size && typeof value === 'object') {
						// Watch this as well
						value = watchObjectLevel(value, nextLevel.map, onAccessed);
					}

					const accessProp = (() => {
						if (isArr) {
							if (typeof prop === 'symbol') return prop;
							return parseInt(prop + '');
						} else {
							return prop;
						}
					})();

					const oldValue = obj[accessProp];
					obj[accessProp] = value;
					if (oldValue !== value) {
						onAccessed();
					}
				} else {
					obj[prop] = value;
				}
				return true;
			},
			deleteProperty(_obj, prop) {
				if (Reflect.has(obj, prop)) {
					const deleted = Reflect.deleteProperty(obj, prop);
					// istanbul ignore next
					if (deleted && ((typeof prop !== 'symbol' && (level.has(prop + '')) || level.has('*')))) {
						onAccessed();
					}
					return deleted;
				}
				return true;
			}
		});
		for (const name of Object.keys(obj)) {
			if ((level.has(name) || level.has('*')) && typeof obj[name] === 'object') {
				obj[name] = watchObjectLevel(obj[name], 
					(level.get(name) || level.get('*')!).map, onAccessed);
			}
		}
		return proxy;
	}

	function watchObject(obj: any, properties: PathLevel, callback: () => void) {
		if (typeof obj !== 'object' || obj === undefined || obj === null || obj instanceof HTMLElement) {
			return obj;
		}
		if (typeof Proxy === 'undefined') {
			console.warn('Attempted to watch object while proxy method is not supported');
			return obj;
		}

		if (properties.has('**')) {
			return createDeepProxy(obj, callback);
		} else {
			return watchObjectLevel(obj, properties, callback);
		}
	}


	type QueueRenderFn = (changeType: CHANGE_TYPE) => void;

	export function watchValue(render: QueueRenderFn, value: any, watch: boolean, watchProperties: string[]) {
		if (typeof value === 'object' && (watch || watchProperties.length > 0)) {
			value = watchObject(value, watchProperties.length ? 
					getProxyStructure(watchProperties) : new Map([['*', {
						name: '*',
						relevantPaths: [],
						watchCurrent: true,
						map: new Map()
					}]]), () => {
				render(CHANGE_TYPE.PROP)
			});
		}
		return value;
	}
}

const cachedCasing = new Map<string, string>();
function dashesToCasing(name: string) {
	const cached = cachedCasing.get(name);
	if (cached) {
		return cached;
	}

	if (name.indexOf('-') === -1) return name;

	let newStr = '';
	for (let i = 0; i < name.length; i++) {
		if (name[i] === '-') {
			newStr += name[i + 1].toUpperCase();
			i++;
		} else {
			newStr += name[i];
		}
	}
	cachedCasing.set(name, newStr);
	return newStr;
}

/**
 * Converts casing to dashes
 * 
 * **Example:**
 * "camelCasedName" -> "camel-cased-name"
 * 
 * @param {string} name - The name/string to convert
 * 
 * @returns {string} - The hyphen/dashes-cased string
 */
export function casingToDashes(name: string): string {
	if (!/[A-Z]/.test(name)) return name;

	let newStr = '';
	for (const char of name) {
		const code = char.charCodeAt(0);
		if (code >= 65 && code <= 90) {
			newStr += '-' + char.toLowerCase();
		} else {
			newStr += char;
		}
	}
	return newStr;
}

function getCoerced(initial: any, mapType: DefinePropTypes) {
	switch (mapType) {
		case PROP_TYPE.STRING:
			return initial || '';
		case PROP_TYPE.BOOL:
			return initial || false;
		case PROP_TYPE.NUMBER:
			return initial || 0;
	}
	return initial;
}

const connectMap = new WeakMap<HTMLElement, any>();
const connectedElements = new WeakSet<HTMLElement>();

/**
 * Waits for the element to be connected to the DOM
 * (`connectedCallback` was called)
 * 
 * @param {HTMLElement} el - The element for which
 * to wait for it to be connected to the DOM.
 * 
 * @returns {Promise<void>} - A promise that resolves when
 * 	the element has been connected
 */
export async function awaitConnected(el: HTMLElement): Promise<void> {
	/* istanbul ignore next */
    if (connectedElements.has(el)) return;
    await new Promise(async (resolve) => {
        const arr = connectMap.get(el) || [];
        arr.push(resolve);
        connectMap.set(el, arr);
    });
}

/**
 * Hooks into the `connectedCallback` function of the element
 * and runs the passed function in it
 * 
 * @param {HTMLElement} el - The element for which to
 * hook into its `connectedCallback`
 * @param {() => any} fn - A function to call 
 * in the `connectedCallback`
 * 
 * @returns {Promise<void>} - A promise that resolves when
 * 	the function has been called (aka `connectedCallback`
 * 	was called)
 */
export async function hookIntoConnect(el: HTMLElement, fn: () => any): Promise<void> {
	// istanbul ignore next
    if (connectedElements.has(el)) {
		fn(); 
        return;
    }
    await new Promise(async (resolve) => {
		/* istanbul ignore next */
        const arr = connectMap.get(el) || [];
        arr.push(() => {
            fn();
            resolve();
        });
        connectMap.set(el, arr);
    });
}

type HTMLElementAttributes = Pick<HTMLElement, 
	'setAttribute'|'removeAttribute'|'hasAttribute'|'getAttribute'|'tagName'>;

/**
 * The type that can be passed to `Props.define(xxx, { })`
 */
export interface PropComponent extends HTMLElementAttributes {
	renderToDOM(changeType: number): void;
	getParentRef?(ref: string): any;
	isMounted: boolean;
	fire<EV extends keyof PROP_EVENTS, R extends PROP_EVENTS[EV]['returnType']>(
		event: EV|any, ...params: PROP_EVENTS[EV]['args']|any): R[]
	self: {
		mixins?: any[];
	}|any;
}

type _Remove<A extends {
	[key: string]: any;
}, B> = {
	[K in keyof A]: A[K] extends B ? never : K;
}[keyof A];

type RemoveType<A extends {
	[key: string]: any;
}, B> = {
	[K in _Remove<A, B>]: A[K];
}

// Reflect and private type configs
interface PropTypeConfig {
	[key: string]: DefinePropTypes|DefinePropTypeConfig;
};
type ReturnType<R extends PropTypeConfig, P extends PropTypeConfig> = {
	[K in keyof RemoveType<{
		[K2 in keyof R]: IsUnassigned<R[K2]>;
	}, false>]?: GetTSType<R[K]>
} & {
	[K in keyof Omit<R, keyof RemoveType<{
		[K2 in keyof R]: IsUnassigned<R[K2]>;
	}, false>>]: GetTSType<R[K]>
} &  {
	[K in keyof RemoveType<{
		[K2 in keyof P]: IsUnassigned<P[K2]>;
	}, false>]?: GetTSType<P[K]>
} & {
	[K in keyof Omit<P, keyof RemoveType<{
		[K2 in keyof P]: IsUnassigned<P[K2]>;
	}, false>>]: GetTSType<P[K]>
};
type SimpleReturnType<R extends PropTypeConfig, P extends PropTypeConfig> = {
	[K in keyof P]: GetTSType<P[K]>;
} & {
	[K in keyof R]: GetTSType<R[K]>;
};

namespace PropsDefiner {
	type KeyPart<C extends PropTypeConfig, B extends boolean> = {
		key: Extract<keyof C, string>;
		value: C[keyof C];
		reflectToAttr: B;
	};
	type Keys<R extends PropTypeConfig, P extends PropTypeConfig> = (KeyPart<R, true>|KeyPart<P, false>)[];

	const renderMap: WeakMap<PropComponent, CHANGE_TYPE> = new WeakMap();

	function queueRender(element: PropComponent, changeType: CHANGE_TYPE) {
		if (!renderMap.has(element)) {
			renderMap.set(element, changeType);
		}

		setTimeout(() => {
			element.renderToDOM(renderMap.get(element)!);
			renderMap.delete(element);
		}, 0);
	}

	function createQueueRenderFn(element: PropComponent) {
		return (changeType: CHANGE_TYPE) => {
			queueRender(element, changeType);
		}
	}

	class ElementRepresentation<R extends PropTypeConfig, P extends PropTypeConfig> {
		public setAttr: (name: string, value: string) => void;
		public removeAttr: (name: string) => void;
		public keyMap: Map<Extract<keyof R|keyof P, string>, {
			watch: boolean;
			coerce: boolean;
			mapType: DefinePropTypes;
			reflectToAttr: boolean;
			strict: boolean;
		}> = new Map();
		public propValues: Partial<SimpleReturnType<R, P>> = {};
		public preMountedQueue: {
			set: [string, string][],
			remove: string[]
		} = {
			set: [],
			remove: []
		};

		constructor(public component: PropComponent) {
			this.setAttr = component.setAttribute.bind(component);
			this.removeAttr = component.removeAttribute.bind(component);
		}

		public overrideAttributeFunctions() {
			this.component.setAttribute = (key: string, val: string) => {
				if (!this.component.isMounted) {
					this.preMountedQueue.set.push([key, val]);
					this.setAttr(key, val);
					return;
				}

				onSetAttribute(key, val, this);
			};
			this.component.removeAttribute = (key: string) => {
				if (!this.component.isMounted) {
					this.preMountedQueue.remove.push(key);
					this.removeAttr(key);
					return;
				}

				onRemoveAttribute(key, this);
			};
		}

		public runQueued() {
			this.preMountedQueue.set.forEach(([key, val]) => onSetAttribute(key, val, this));
			this.preMountedQueue.remove.forEach(key => onRemoveAttribute(key, this));
			queueRender(this.component, CHANGE_TYPE.PROP);
		}
	}

	function getKeys<R extends PropTypeConfig, P extends PropTypeConfig>({
		reflect = {} as R, priv = {} as P
	}: {
		reflect?: R;
		priv?: P;
	}): Keys<R, P> {
		return [...Object.getOwnPropertyNames(reflect).map((key) => {
			return {
				key: key as Extract<keyof R, string>,
				value: reflect[key],
				reflectToAttr: true
			}
		}) as KeyPart<R, true>[], ...Object.getOwnPropertyNames(priv).map((key) => {
			return {
				key: key as Extract<keyof P, string>,
				value: priv[key],
				reflectToAttr: false
			}
		}) as KeyPart<P, false>[]];
	}

	function onSetAttribute<R extends PropTypeConfig, P extends PropTypeConfig>(
		key: string, val: string, el: ElementRepresentation<R, P>) {
			const casingKey = dashesToCasing(key) as Extract<keyof R|keyof P, string>;
			if (el.keyMap.has(casingKey)) {
				const { 
					watch, mapType, strict
				} = el.keyMap.get(casingKey)!;

				const prevVal = el.propValues[casingKey];
				const newVal = getterWithVal(el.component, val, strict, mapType);

				if (prevVal === newVal) return;
				
				el.component.fire('beforePropChange', casingKey, newVal, prevVal);
				el.propValues[casingKey] = newVal as any;
				el.component.fire('propChange', casingKey, newVal, prevVal);

				if (watch) {
					queueRender(el.component, CHANGE_TYPE.PROP);
				}
			} else {
				el.propValues[casingKey] = val as any;
			}
			el.setAttr(key, val);
		}

	function onRemoveAttribute<R extends PropTypeConfig, P extends PropTypeConfig>(
		key: string, el: ElementRepresentation<R, P>) {
			const casingKey = dashesToCasing(key) as Extract<keyof R|keyof P, string>;
				if (el.keyMap.has(casingKey)) {
					const { 
						watch, coerce, mapType
					} = el.keyMap.get(casingKey)!;

					const prevVal = el.propValues[casingKey];
					const newVal = (() => {
						if (coerce) {
							return getCoerced(undefined, mapType)
						}
						if (mapType === PROP_TYPE.BOOL) {
							return false;
						}
						return undefined;
					})();

					if (prevVal !== newVal) {
						el.component.fire('beforePropChange', casingKey, newVal, prevVal);
						el.propValues[casingKey] = newVal;
						el.component.fire('propChange', casingKey, newVal, prevVal);

						if (watch) {
							queueRender(el.component, CHANGE_TYPE.PROP);
						}
					}
				}
				el.removeAttr(key);
		}

	const elementConfigs: WeakMap<Props, {
		element: ElementRepresentation<PropTypeConfig, PropTypeConfig>;
		composite: boolean;
	}> = new WeakMap();

	interface PropConfig<R,P> extends Omit<Required<DefinePropTypeConfig>, 'value'|'exactType'> {
		mapKey: Extract<keyof P|keyof R, string>;
		key: string;
		reflectToAttr: boolean;
		propName: string;
	}

	class Property<R extends PropTypeConfig, P extends PropTypeConfig, K extends KeyPart<R, true>|KeyPart<P, false>,
		Z extends ReturnType<R, P>> {
			constructor(private _propertyConfig: K, private _rep: ElementRepresentation<R, P>,
				private _props: Props & Partial<Z>) { }

			private __getConfig(): PropConfig<P, R> {
				const { key, value, reflectToAttr } = this._propertyConfig;
				const mapKey = key;

				const propName = casingToDashes(mapKey);
				const { 
					watch = true,
					coerce = false,
					defaultValue,
					value: defaultValue2,
					type: type,
					strict = false,
					watchProperties = [],
					reflectToSelf = true
				} = getDefinePropConfig(value);
				return {
					watch, coerce, type, strict, 
					watchProperties, reflectToSelf,
					mapKey: mapKey as any, key, reflectToAttr, propName,
					defaultValue: defaultValue !== undefined ? defaultValue : defaultValue2
				}
			}

			private __config: PropConfig<P,R>|null = null;
			public get config() {
				if (this.__config) {
					return this.__config;
				}
				return (this.__config = this.__getConfig());
			}

			public setKeyMap(keyMap: Map<Extract<keyof R|keyof P, string>, {
				watch: boolean;
				coerce: boolean;
				mapType: DefinePropTypes;
				strict: boolean;
				reflectToAttr: boolean;
			}>) {
				const { key } = this._propertyConfig;
				const { 
					watch,
					coerce,
					type: mapType,
					strict,
					reflectToAttr
				} = this.config;

				keyMap.set(key, {
					watch, coerce, mapType, strict, reflectToAttr
				});
			}

			private _setReflect() {
				const _this = this;
				const { mapKey } = this.config;

				if (mapKey in this._rep.component) return;
				Object.defineProperty(this._rep.component, mapKey, {
					get() {
						return _this._rep.propValues[mapKey];
					},
					set(value) {
						const props = _this._props as SimpleReturnType<R, P>;
						if (props[mapKey] === value) return;
						props[mapKey] = value;
					}
				});
			}

			public setReflect() {
				const { reflectToSelf } = this.config;
				if (reflectToSelf) {
					this._setReflect();
				}
			}

			public setPropAccessors() {
				const _this = this;
				const { 
					mapKey, coerce, type, key,
					watch, watchProperties, propName
				} = this.config;
				Object.defineProperty(this._props, mapKey, {
					get() {
						const value = _this._rep.propValues[mapKey];
						if (coerce) {
							return getCoerced(value, type);
						}
						return value;

					},
					set(value) {
						const original = value;
						value = Watching.watchValue(createQueueRenderFn(_this._rep.component), 
							value, watch, watchProperties);

						if ((<SimpleReturnType<R, P>>_this._props)[mapKey] === value) return;
						const prevVal = _this._rep.propValues[mapKey];
						_this._rep.component.fire('beforePropChange', key, value, prevVal);
						_this._rep.propValues[mapKey] = value;
						_this._rep.component.fire('propChange', key, value, prevVal);
						if (_this._propertyConfig.reflectToAttr) {
							setter(_this._rep.setAttr, _this._rep.removeAttr, propName, 
								original, type);
						}

						if (watch) {
							queueRender(_this._rep.component, CHANGE_TYPE.PROP);
						}
					}
				});
			}

			public async assignComplexType() {
				const { 
					type, mapKey, propName, strict, watch,
					watchProperties
				} = this.config;
				await hookIntoConnect(this._rep.component as any, () => {
					this._rep.propValues[mapKey] = Watching.watchValue(createQueueRenderFn(this._rep.component), 
						this._rep.component.hasAttribute(propName) ?
							getter(this._rep.component, propName, strict, type) as any : undefined,
						watch, watchProperties);
				});
			}

			public assignSimpleType() {
				const { 
					type, mapKey, propName, strict, watch,
					watchProperties
				} = this.config;
				this._rep.propValues[mapKey] = Watching.watchValue(createQueueRenderFn(this._rep.component), 
					this._rep.component.hasAttribute(propName) || (strict && type === 'bool') ?
						getter(this._rep.component, propName, strict, type) as any : undefined,
					watch, watchProperties);
			}

			public async doDefaultAssign() {
				const { 
					defaultValue, mapKey, watch, watchProperties,
					propName, type, reflectToAttr
				} = this.config;
				if (defaultValue !== undefined) {
					await hookIntoConnect(this._rep.component as any, () => {
						if (this._rep.propValues[mapKey] === undefined) {
							this._rep.propValues[mapKey] = Watching.watchValue(
								createQueueRenderFn(this._rep.component), 
								defaultValue as any, watch, watchProperties);
						}
						if (reflectToAttr) {
							setter(this._rep.setAttr, this._rep.removeAttr, propName, 
								this._rep.propValues[mapKey], type as any);
						}
					});
				} else if (type === complex && reflectToAttr) {
					await hookIntoConnect(this._rep.component as any, () => {
						setter(this._rep.setAttr, this._rep.removeAttr, propName,
							this._rep.propValues[mapKey] as any, type);
					});
				}
			}
		}

	async function defineProperties<R extends PropTypeConfig, P extends PropTypeConfig, Z extends ReturnType<R, P>>(
		element: ElementRepresentation<PropTypeConfig, PropTypeConfig>, 
		props: Props & Partial<Z>, config: {
			reflect?: R;
			priv?: P;
		}) {
			const keys = getKeys(config);
			const properties = keys.map(key => new Property(key, element, props));
			properties.forEach(property => property.setKeyMap(element.keyMap));
			properties.forEach(property => property.setReflect());
			properties.forEach(property => property.setPropAccessors());
			await Promise.all(properties.map(async (property) => {
				/**
				 * If type is simple, check for values first and then assign default value
				 * 
				 * If type is complex, there are two cases
				 * 		If the value is a ref it should wait for that ref
				 * 			to resolve through its parent and in the meantime
				 * 			assign a default value
				 *		If the value is not a ref it should assign it
				 * 			and otherwise do the default
				 * 		If there is no value, the default should be assigned
				 */
				if (property.config.type !== complex) {
					property.assignSimpleType();
					return property.doDefaultAssign();
				}

				return Promise.all([
					property.assignComplexType(),
					property.doDefaultAssign()
				]);
			}));
		}

	export async function define<R extends PropTypeConfig, P extends PropTypeConfig, Z extends ReturnType<R, P>>(
		props: Props & Partial<Z>, component: PropComponent, config: {
			reflect?: R;
			priv?: P;
		}) {
			const element = new ElementRepresentation(component);

			element.overrideAttributeFunctions();
			awaitConnected(component as any).then(() => {
				element.runQueued();
			});

			elementConfigs.set(props, {
				composite: false,
				element
			});

			await defineProperties(element, props, config);
		}

	export async function joinProps<R extends PropTypeConfig, P extends PropTypeConfig, PP extends PropReturn<any, any>>(
		previousProps: PP, config: {
			reflect?: R;
			priv?: P;
		}) {
			/* istanbul ignore next */
			if (!elementConfigs.has(previousProps)) {
				throw new Error('Previous props not defined');
			}
			const { element } = elementConfigs.get(previousProps)!;

			elementConfigs.set(previousProps, {
				composite: true,
				element
			});

			await defineProperties(element, previousProps, config);
		}
}

/**
 * The type of a prop config object. This is the value
 * that is passed to the `reflect` and `priv` keys
 */
export type PropConfigObject = {
	[key: string]: DefinePropTypes|DefinePropTypeConfig;
};

/**
 * The return type given the two prop config objects (
 * the public one and the private one))
 */
export type PropReturn<PUB extends PropConfigObject, PRIV extends PropConfigObject> = {
	[K in keyof PUB]: GetTSType<PUB[K]>;
} & {
	[K in keyof PRIV]: GetTSType<PRIV[K]>;
}

/**
 * A map of element tag names to prop configs
 */
export const propConfigs: Map<string, {
	reflect?: PropConfigObject;
	priv?: PropConfigObject;
}> = new Map();

/**
 * A class used to define properties for components
 */
export class Props {
	/**
	 * Defines properties on this component
	 * 
	 * @template PUB - The public properties
	 * @template PRIV - The private properties
	 * @template R - The return value
	 * @template PP - The parent's properties
	 * 
	 * @param {PropComponent} element - The
	 * 	element on which to define these properties
	 * @param {{ reflect?: PUB; priv?: PRIV; }} [config] - The
	 * 	configuration for these properties
	 * @param {PropReturn<any, any>} [parentProps] - The
	 * 	properties of the parent that should be merged
	 * 	with the properties of this element
	 * 
	 * @returns {Props & R} The properties for 
	 * 	this component
	 */
	static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>>(
		element: PropComponent, props?: {
			reflect: PUB;
			priv: PRIV;
		}): Props & ReturnType<PUB, PRIV>;
	static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>>(
		element: PropComponent, props?: {
			priv: PRIV;
		}): Props & ReturnType<{}, PRIV>;
	static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>>(
		element: PropComponent, props?: {
			reflect: PUB;
		}): Props & ReturnType<PUB, {}>;
	static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>>(
		element: PropComponent, props?: { }): Props;
	static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>, PP extends PropReturn<any, any>>(
		element: PropComponent, props: {
			reflect: PUB;
			priv: PRIV;
		}, parentProps: PP): ReturnType<PUB, PRIV> & PP;
	static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>, PP extends PropReturn<any, any>>(
		element: PropComponent, props: {
			priv: PRIV;
		}, parentProps: PP): ReturnType<{}, PRIV> & PP;
	static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>, PP extends PropReturn<any, any>>(
		element: PropComponent, props: {
			reflect: PUB;
		}, parentProps: PP): Props & ReturnType<PUB, {}> & PP;
	static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>, PP extends PropReturn<any, any>>(
		element: PropComponent, props: { }, parentProps: PP): Props & PP;
	static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>, PP extends PropReturn<any, any>>(
		element: PropComponent, config: {
			reflect?: PUB;
			priv?: PRIV;
		} = {}, parentProps: PP = (element as any).props): Props & R & PP {
			const tag = element.tagName.toLowerCase();
			if (propConfigs.has(tag)) {
				propConfigs.set(tag, {...propConfigs.get(tag)!, ...config});
			} else {
				propConfigs.set(tag, config);
			}

			// if parentProps = {}, that is the default value created in base.ts
			// ignore that as it's neither a Props object or something the user passed
			if (parentProps && !(typeof parentProps === 'object' && Object.keys(parentProps).length === 0 && !(parentProps instanceof Props))) {
				if (typeof parentProps !== 'object' || !(parentProps instanceof Props)) {
					throw new Error('Parent props should be a Props object');
				}

				PropsDefiner.joinProps(parentProps, config);
				return parentProps as Props & R & PP;
			}

			const props = new Props();
			PropsDefiner.define(props as Props & Partial<R>, element, config);
			return props as Props & R & PP;
		}

	/**
	 * A function that will be called when the passed element
	 * is connected to the dom (`connectedCallback` is called).
	 * This is only used by the library and has no other uses.
	 * 
	 * @param {HTMLElement} - The element that was connected
	 */
	static onConnect(element: HTMLElement) {
		if (connectMap.has(element)) {
			for (const listener of connectMap.get(element)!) {
				listener();
			}
		}
		connectedElements.add(element);
	}
}

/**
 * Events that the props can trigger
 */
export type PROP_EVENTS = {
	beforePropChange: {
		args: [string, any, any];
		returnType: void;
	};
	propChange: {
		args: [string, any, any];
		returnType: void;
	}
};