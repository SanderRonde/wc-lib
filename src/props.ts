import { hookIntoMount, awaitMounted } from './template-util';
import { CHANGE_TYPE } from './base';

export const refPrefix = '___complex_ref';

function getterWithVal<R>(component: {
	getParentRef(ref: string): any;
}, value: string|null, strict: boolean, type: 'string'|'number'|'bool'|typeof complex): boolean|string|number|undefined|R;
function getterWithVal(component: {
	getParentRef(ref: string): any;
}, value: string|null, strict: boolean, type: 'bool'): boolean;
function getterWithVal(component: {
	getParentRef(ref: string): any;
}, value: string|null, strict: boolean, type: 'string'): string|undefined;
function getterWithVal(component: {
	getParentRef(ref: string): any;
}, value: string|null, strict: boolean, type: 'number'): number|undefined;
function getterWithVal<R>(component: {
	getParentRef(ref: string): any;
}, value: string|null, strict: boolean, type: typeof complex): R|undefined;
function getterWithVal<R>(component: {
	getParentRef(ref: string): any;
}, value: string|null, strict: boolean, type: 'string'|'number'|'bool'|typeof complex): boolean|string|number|undefined|R {
	if (type === 'bool') {
		if (strict) {
			return (value + '') === 'true';
		}
		return value !== undefined && value !== null && value !== 'false';
	} else {
		if (value !== undefined && value !== null && value !== 'false') {
			if (type === 'number') {
				return ~~value;
			} else if (type === complex) {
				if (value.startsWith(refPrefix)) {
					return component.getParentRef(value);
				} else {
					return JSON.parse(decodeURIComponent(value));
				}
			}
			return value;
		}
		return undefined;
	}
}

export function getter<R>(element: HTMLElement & {
	getParentRef(ref: string): any;
}, name: string, strict: boolean, type: 'string'|'number'|'bool'|typeof complex): boolean|string|number|undefined|R;
export function getter(element: HTMLElement & {
	getParentRef(ref: string): any;
}, name: string, strict: boolean, type: 'bool'): boolean;
export function getter(element: HTMLElement & {
	getParentRef(ref: string): any;
}, name: string, strict: boolean, type: 'string'): string|undefined;
export function getter(element: HTMLElement & {
	getParentRef(ref: string): any;
}, name: string, strict: boolean, type: 'number'): number|undefined;
export function getter<R>(element: HTMLElement & {
	getParentRef(ref: string): any;
}, name: string, strict: boolean, type: typeof complex): R|undefined;
export function getter<R>(element: HTMLElement & {
	getParentRef(ref: string): any;
}, name: string, strict: boolean, type: 'string'|'number'|'bool'|typeof complex): boolean|string|number|undefined|R {
	return getterWithVal(element, element.getAttribute(name), strict, type);
}

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

type GetTSType<V extends PROP_TYPE|ComplexType<any>|DefinePropTypeConfig> = 
	V extends PROP_TYPE.BOOL ? boolean : 
	V extends PROP_TYPE.NUMBER ?  number : 
	V extends PROP_TYPE.STRING ? string : 
	V extends ComplexType<infer R> ? R : 
	V extends DefineTypeConfig ? 
		V extends ExactTypeHaver ? V['exactType'] :
			V['type'] extends PROP_TYPE.BOOL ? 
				V extends Coerced ? boolean : boolean|undefined : 
			V['type'] extends PROP_TYPE.NUMBER ? 
				V extends Coerced ? number : number|undefined : 
			V['type'] extends PROP_TYPE.STRING ? 
				V extends Coerced ? string : string|undefined : 
			V['type'] extends ComplexType<infer R> ? R :
				void : void;

export const enum PROP_TYPE {
	STRING = 'string',
	NUMBER = 'number',
	BOOL = 'bool'
}
type ComplexType<T> = typeof complex & {
	__data: T;
};

const complex = Symbol('complex type');

export function ComplexType<T>(): ComplexType<T> {
	return complex as ComplexType<T>;
}

type DefinePropTypes = PROP_TYPE|ComplexType<any>;
interface DefineTypeConfig {
	type: DefinePropTypes;
}
interface DefinePropTypeConfig extends DefineTypeConfig {
	watch?: boolean;
	defaultValue?: GetTSType<this['type']>;
	value?: GetTSType<this['type']>;
	watchProperties?: string[];
	exactType?: any;
	coerce?: boolean;
	strict?: boolean;
	isPrivate?: boolean;
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
			isPrivate: false,
			reflectToSelf: true,
			type: value as DefinePropTypes
		}
	}
}

function createDeepProxy(obj: any, callback: () => void) {
	const proxy = new Proxy(obj, {
		set(_obj, prop, value) {
			if (typeof value === 'object') {
				value = createDeepProxy(value, callback);
			}
			obj[prop] = value;
			callback();
			return true;
		},
		deleteProperty(_obj, prop) {
			if (Reflect.has(obj, prop)) {
				const deleted = Reflect.deleteProperty(obj, prop);
				callback();
				return deleted;
			}
			return false;
		}
	});
	for (const key of Object.keys(obj)) {
		createDeepProxy(obj[key], callback);
	}
	return proxy;
}

function createProxyLevel(obj: any, path: string|'*', nextLevels: (string|'*')[], callback: () => void) {
	const proxy = new Proxy(obj, {
		set(_obj, prop, value) {
			if (path === '*' || prop === path) {
				if (nextLevels.length && typeof value === 'object') {
					value = createProxyLevel(value, 
						nextLevels[0], nextLevels.slice(1), callback);
				}
				obj[prop] = value;
				callback();
			} else {
				obj[prop] = value;
			}
			return true;
		},
		deleteProperty(_obj, prop) {
			if (Reflect.has(obj, prop)) {
				Reflect.deleteProperty(obj, prop);
				callback();
				return true;
			}
			return true;
		}
	});
	if (nextLevels.length && Reflect.has(obj, path)) {
		createProxyLevel(obj[path], nextLevels[0], nextLevels.slice(1), callback);
	}
	return proxy;
}

function watchObject(obj: any, path: (string|'*')[], callback: () => void) {
	if (typeof obj !== 'object' || obj === undefined || obj === null) {
		return obj;
	}
	if (path.indexOf('**') !== -1 && path.length > 1) {
		throw new Error('Attempting to watch object through ** and more path operators')
	}
	if (typeof Proxy === 'undefined') {
		console.warn('Attempted to watch object while proxy method is not supported');
		return obj;
	}

	if (path[0] === '**') {
		return createDeepProxy(obj, callback);
	} else {
		return createProxyLevel(obj, path[0], path.slice(1), callback);
	}
}

function watchArray<T>(arr: T[], path: (string|'*')[], callback: () => void): T[] {
	if (!Array.isArray(arr) || arr === undefined || arr === null) {
		return arr;
	}
	if (path.indexOf('**') !== -1 && path.length > 1) {
		throw new Error('Attempting to watch object through ** and more path operators')
	}
	if (typeof Proxy === 'undefined') {
		console.warn('Attempted to watch array while proxy method is not supported');
		return arr;
	}

	return new Proxy(arr, {
		set(arr, property, value) {
			if (typeof property === 'symbol' ||
				(typeof property !== 'number' &&
				!/^\d+$/.test(property))) {
					arr[property as keyof typeof arr] = value;
					if (property === 'length') {
						callback();
					}
					return true;
				}
			const index = ~~property;

			//An item is replaced
			const isChange = index < arr.length;

			if (path.length === 0) {
				//Only watch the setting of values
				arr[index] = value;
				if (isChange) {
					callback();
				}
				return true;
			}

			//Watch the values themselves as well
			arr[index] = watchObject(value, path, callback);
			if (isChange) {
				callback();
			}
			return true;
		},
		deleteProperty(arr, property) {
			if (typeof property === 'symbol' ||
				(typeof property !== 'number' &&
				!/^\d+$/.test(property))) {
					if (Reflect.has(arr, property)) {
						Reflect.deleteProperty(arr, property);
					}
					return true;
				}

			if (Reflect.has(arr, property)) {
				Reflect.deleteProperty(arr, property);
			}
			return true;
		}
	});
}

const cachedCasing = new Map<string, string>();
function dashesToCasing(name: string) {
	const cached = cachedCasing.get(name);
	if (cached) {
		return cached;
	}

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

function casingToDashes(name: string) {
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

type QueueRenderFn = (changeType: CHANGE_TYPE) => void;

function watchValue(render: QueueRenderFn, value: any, watch: boolean, watchProperties: string[]) {
	if (typeof value === 'object' && !Array.isArray(value) && watchProperties.length > 0) {
		value = watchObject(value, watchProperties, () => {
			render(CHANGE_TYPE.PROP)
		});
	} else if (watch && Array.isArray(value)) {
		value = watchArray(value, [], () => {
			render(CHANGE_TYPE.PROP)
		});
	}
	return value;
}

namespace PropsDefiner {
	// Reflect and private type configs
	interface PropTypeConfig {
		[key: string]: DefinePropTypes|DefinePropTypeConfig;
	};
	type ReturnType<R extends PropTypeConfig, P extends PropTypeConfig> = {
		[K in keyof R]: GetTSType<R[K]>;
	} & {
		[K in keyof P]: GetTSType<P[K]>;
	};
	type KeyPart<C extends PropTypeConfig, B extends boolean> = {
		key: Extract<keyof C, string>;
		value: C[keyof C];
		reflectToAttr: B;
	};
	type Keys<R extends PropTypeConfig, P extends PropTypeConfig> = (KeyPart<R, true>|KeyPart<P, false>)[];
	type Element = HTMLElement & {
		renderToDOM(changeType: CHANGE_TYPE): void;
		getParentRef(ref: string): any;
		isMounted: boolean;
		fire<EV extends keyof DEFAULT_EVENTS, R extends DEFAULT_EVENTS[EV]['returnType']>(
			event: EV, ...params: DEFAULT_EVENTS[EV]['args']): R[]
	};

	const renderMap: WeakMap<HTMLElement, CHANGE_TYPE> = new WeakMap();

	function queueRender(element: HTMLElement & {
		renderToDOM(changeType: CHANGE_TYPE): void;
		getParentRef(ref: string): any;
		fire<EV extends keyof DEFAULT_EVENTS, R extends DEFAULT_EVENTS[EV]['returnType']>(
			event: EV, ...params: DEFAULT_EVENTS[EV]['args']): R[]
	}, changeType: CHANGE_TYPE) {
		if (renderMap.has(element)) {
			const mapped = renderMap.get(element);
			//Check if this change type has higher priority
			if (mapped && mapped & CHANGE_TYPE.ALWAYS) return;
			if (mapped !== changeType) {
				//It's either theme & prop or prop & theme,
				// change it to always render
				renderMap.set(element, CHANGE_TYPE.ALWAYS);
			}
			return;
		}

		renderMap.set(element, changeType);
		setTimeout(() => {
			element.renderToDOM(renderMap.get(element)!);
			renderMap.delete(element);
		}, 0);
	}

	function createQueueRenderFn(element: HTMLElement & {
		renderToDOM(changeType: CHANGE_TYPE): void;
		getParentRef(ref: string): any;
		fire<EV extends keyof DEFAULT_EVENTS, R extends DEFAULT_EVENTS[EV]['returnType']>(
			event: EV, ...params: DEFAULT_EVENTS[EV]['args']): R[]
	}) {
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
			isPrivate: boolean;
			strict: boolean;
		}> = new Map();
		public propValues: Partial<ReturnType<R, P>> = {};
		public preMountedQueue: {
			set: [string, string][],
			remove: string[]
		} = {
			set: [],
			remove: []
		};

		constructor(public component: Element) {
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
					watch, isPrivate, mapType, strict 
				} = el.keyMap.get(casingKey)!;

				const prevVal = el.propValues[casingKey];
				const newVal = getterWithVal(el.component, val, strict, mapType);
				
				el.component.fire('beforePropChange', casingKey, prevVal, newVal);
				el.propValues[casingKey] = newVal as any;
				el.component.fire('propChange', casingKey, prevVal, newVal);

				if (watch) {
					queueRender(el.component, CHANGE_TYPE.PROP);
				}
				if (isPrivate) {
					el.setAttr(casingKey, '_');
					return;
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
					const newVal = coerce ? getCoerced(undefined, mapType) : undefined;

					el.component.fire('beforePropChange', casingKey, prevVal, newVal);
					el.propValues[casingKey] = newVal;
					el.component.fire('propChange', casingKey, prevVal, newVal);

					if (watch) {
						queueRender(el.component, CHANGE_TYPE.PROP);
					}
				}
				el.removeAttr(key);
		}

	class Property<R extends PropTypeConfig, P extends PropTypeConfig, K extends KeyPart<R, true>|KeyPart<P, false>,
		Z extends ReturnType<R, P>> {
			constructor(private _propertyConfig: K, private _rep: ElementRepresentation<R, P>,
				private _props: Props & Partial<Z>) { }

			private _getConfig() {
				const { key, value, reflectToAttr } = this._propertyConfig;
				const mapKey = key as Extract<keyof R|P, string>;

				const propName = casingToDashes(mapKey);
				const { 
					watch = true,
					coerce = false,
					defaultValue,
					value: defaultValue2,
					type: type,
					strict = false,
					isPrivate = false,
					watchProperties = [],
					reflectToSelf = false
				} = getDefinePropConfig(value);
				return {
					watch, coerce, type, strict, 
					isPrivate, watchProperties, reflectToSelf,
					mapKey, key, reflectToAttr, propName,
					defaultValue: defaultValue !== undefined ? defaultValue : defaultValue2
				}
			}

			public setKeyMap(keyMap: Map<Extract<keyof R|keyof P, string>, {
				watch: boolean;
				coerce: boolean;
				mapType: DefinePropTypes;
				isPrivate: boolean;
				strict: boolean;
			}>) {
				const { key } = this._propertyConfig;
				const { 
					watch = true,
					coerce = false,
					type: mapType,
					strict = false,
					isPrivate = false,
				} = this._getConfig();

				keyMap.set(key, {
					watch, coerce, mapType, isPrivate, strict
				});
			}

			private _setReflect() {
				const _this = this;
				const { mapKey, isPrivate, strict, type, key, propName } = this._getConfig();
				Object.defineProperty(this._rep.component, mapKey, {
					get() {
						if (isPrivate) {
							return _this._rep.propValues[mapKey];
						}
						return getter(_this._rep.component, propName, strict, type);
					},
					set(value) {
						const prevVal = _this._props[mapKey];
						_this._rep.component.fire('beforePropChange', key, prevVal, value);
						_this._props[mapKey] = value;
						_this._rep.component.fire('propChange', key, prevVal, value);
					}
				});
			}

			public setReflect() {
				const { reflectToAttr, reflectToSelf } = this._getConfig();
				if (reflectToSelf && reflectToAttr) {
					this._setReflect();
				}
			}

			public setPropAccessors() {
				const _this = this;
				const { 
					mapKey, isPrivate, coerce, type, key,
					watch, watchProperties, propName
				} = this._getConfig();
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
						value = watchValue(createQueueRenderFn(_this._rep.component), 
							value, watch, watchProperties);

						const prevVal = _this._rep.propValues[mapKey];
						_this._rep.component.fire('beforePropChange', key, prevVal, value);
						_this._rep.propValues[mapKey] = value;
						_this._rep.component.fire('propChange', key, prevVal, value);
						if (_this._propertyConfig.reflectToAttr) {
							setter(_this._rep.setAttr, _this._rep.removeAttr, propName, 
								isPrivate ? '_' : original, type);
						}

						if (watch) {
							queueRender(_this._rep.component, CHANGE_TYPE.PROP);
						}
					}
				});
			}

			public async doInitialAssign() {
				const { 
					type, mapKey, propName, strict, watch,
					watchProperties, isPrivate
				} = this._getConfig();
				if (type !== complex) {
					this._rep.propValues[mapKey] = watchValue(createQueueRenderFn(this._rep.component), 
						getter(this._rep.component, propName, strict, type) as any, 
						watch, watchProperties);
				} else {
					await hookIntoMount(this._rep.component as any, () => {
						if (!isPrivate || this._rep.component.getAttribute(propName) !== '_') {
							this._rep.propValues[mapKey] = watchValue(createQueueRenderFn(this._rep.component), 
								getter(this._rep.component, propName, strict, type) as any, 
								watch, watchProperties);
						}
					});
				}
			}

			public async doDefaultAssign() {
				const { 
					defaultValue, mapKey, watch, watchProperties,
					propName, isPrivate, type
				} = this._getConfig();
				if (defaultValue !== undefined && this._rep.propValues[mapKey] === undefined) {
					this._rep.propValues[mapKey] = watchValue(
						createQueueRenderFn(this._rep.component), 
						defaultValue as any, watch, watchProperties);
					await hookIntoMount(this._rep.component as any, () => {
						setter(this._rep.setAttr, this._rep.removeAttr, propName, 
							isPrivate ? '_' : defaultValue, type);
					});
				} else if (isPrivate || type === complex) {
					await hookIntoMount(this._rep.component as any, () => {
						setter(this._rep.setAttr, this._rep.removeAttr, propName,
							isPrivate ? '_' : this._rep.propValues[mapKey] as any, type);
					});
				}
			}
		}

	export function define<R extends PropTypeConfig, P extends PropTypeConfig, Z extends ReturnType<R, P>>(
		props: Props & Partial<Z>, component: Element, config: {
			reflect?: R;
			priv?: P;
		} = {}) {
			const element = new ElementRepresentation(component);

			element.overrideAttributeFunctions();
			awaitMounted(component as any).then(() => {
				element.runQueued();
			});

			const keys = getKeys(config);
			const properties = keys.map(key => new Property(key, element, props));
			properties.forEach(property => property.setKeyMap(element.keyMap));
			properties.forEach(property => property.setReflect());
			properties.forEach(property => property.setPropAccessors());
			properties.forEach(async (property) => {
				await property.doInitialAssign();
				await property.doDefaultAssign();
			});
		}
}

export class Props {
	static define<P extends {
		[key: string]: DefinePropTypes|DefinePropTypeConfig;
	}, T extends {
		[key: string]: DefinePropTypes|DefinePropTypeConfig;
	}, R extends {
		[K in keyof P]: GetTSType<P[K]>;
	} & {
		[K in keyof T]: GetTSType<T[K]>;
	}>(element: HTMLElement & {
		renderToDOM(changeType: CHANGE_TYPE): void;
		getParentRef(ref: string): any;
		fire<EV extends keyof DEFAULT_EVENTS, R extends DEFAULT_EVENTS[EV]['returnType']>(
			event: EV|any, ...params: DEFAULT_EVENTS[EV]['args']|any): R[]
	}, props: {
		reflect: P;
		priv: T;
	}): Props & {
		[K in keyof P]: GetTSType<P[K]>;
	} & {
		[K in keyof T]: GetTSType<T[K]>;
	};
	static define<P extends {
		[key: string]: DefinePropTypes|DefinePropTypeConfig;
	}, T extends {
		[key: string]: DefinePropTypes|DefinePropTypeConfig;
	}, R extends {
		[K in keyof P]: GetTSType<P[K]>;
	} & {
		[K in keyof T]: GetTSType<T[K]>;
	}>(element: HTMLElement & {
		renderToDOM(changeType: CHANGE_TYPE): void;
		getParentRef(ref: string): any;
		fire<EV extends keyof DEFAULT_EVENTS, R extends DEFAULT_EVENTS[EV]['returnType']>(
			event: EV|any, ...params: DEFAULT_EVENTS[EV]['args']|any): R[]
	}, props: {
		priv?: T;
	}): Props & {
		[K in keyof T]: GetTSType<T[K]>;
	};
	static define<P extends {
		[key: string]: DefinePropTypes|DefinePropTypeConfig;
	}, T extends {
		[key: string]: DefinePropTypes|DefinePropTypeConfig;
	}, R extends {
		[K in keyof P]: GetTSType<P[K]>;
	} & {
		[K in keyof T]: GetTSType<T[K]>;
	}>(element: HTMLElement & {
		renderToDOM(changeType: CHANGE_TYPE): void;
		getParentRef(ref: string): any;
		fire<EV extends keyof DEFAULT_EVENTS, R extends DEFAULT_EVENTS[EV]['returnType']>(
			event: EV|any, ...params: DEFAULT_EVENTS[EV]['args']|any): R[]
	}, props: {
		reflect: P;
	}): Props & {
		[K in keyof P]: GetTSType<P[K]>;
	};
	static define<P extends {
		[key: string]: DefinePropTypes|DefinePropTypeConfig;
	}, T extends {
		[key: string]: DefinePropTypes|DefinePropTypeConfig;
	}, R extends {
		[K in keyof P]: GetTSType<P[K]>;
	} & {
		[K in keyof T]: GetTSType<T[K]>;
	}>(element: HTMLElement & {
		renderToDOM(changeType: CHANGE_TYPE): void;
		getParentRef(ref: string): any;
		isMounted: boolean;
		fire<EV extends keyof DEFAULT_EVENTS, R extends DEFAULT_EVENTS[EV]['returnType']>(
			event: EV|any, ...params: DEFAULT_EVENTS[EV]['args']|any): R[]
	}, config: {
		reflect?: P;
		priv?: T;
	} = {}): Props & R {
		const props = new Props();
		PropsDefiner.define(props as Props & Partial<R>, element, config);
		return props as Props & R;
	}
}

type DEFAULT_EVENTS = {
	beforePropChange: {
		args: [string, any, any];
		returnType: void;
	};
	propChange: {
		args: [string, any, any];
		returnType: void;
	}
};