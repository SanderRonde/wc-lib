/**
 * The prefix used for complex references
 *
 * @constant
 */
export declare const refPrefix = "___complex_ref";
/**
 * Gets the property with name `name`
 * from `element`
 *
 * @template R - The return value
 *
 * @param {HTMLElement & { getParentRef(ref: string): any; }} element - The
 * 	element from which to get the property
 * @param {string} name - The name of the property
 * @param {boolean} strict - Whether to use strict mode.
 * 	If true, boolean type values are only true
 * 	if the value is 'true', not just any truthy value
 * @param {'string'|'number'|'bool'|typeof complex} type - The
 * 	type of the value
 *
 * @returns {boolean|string|number|undefined|R} The value
 */
export declare function getter<R>(element: HTMLElement & {
    getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: 'string' | 'number' | 'bool' | typeof complex): boolean | string | number | undefined | R;
export declare function getter(element: HTMLElement & {
    getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: 'bool'): boolean;
export declare function getter(element: HTMLElement & {
    getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: 'string'): string | undefined;
export declare function getter(element: HTMLElement & {
    getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: 'number'): number | undefined;
export declare function getter<R>(element: HTMLElement & {
    getParentRef?(ref: string): any;
}, name: string, strict: boolean, type: typeof complex): R | undefined;
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
export declare function setter(setAttrFn: (key: string, val: string) => void, removeAttrFn: (key: string) => void, name: string, value: string | boolean | number, type: 'string' | 'number' | 'bool' | typeof complex): void;
export declare function setter(setAttrFn: (key: string, val: string) => void, removeAttrFn: (key: string) => void, name: string, value: any, type: typeof complex): void;
export declare function setter(setAttrFn: (key: string, val: string) => void, removeAttrFn: (key: string) => void, name: string, value: boolean, type: 'bool'): void;
export declare function setter(setAttrFn: (key: string, val: string) => void, removeAttrFn: (key: string) => void, name: string, value: string, type: 'string'): void;
export declare function setter(setAttrFn: (key: string, val: string) => void, removeAttrFn: (key: string) => void, name: string, value: number, type: 'number'): void;
interface ExactTypeHaver {
    exactType: any;
}
interface Coerced {
    coerce: true;
}
declare type PreDefined = {
    value: any;
} | {
    defaultValue: any;
};
declare type IsUnassigned<V extends PROP_TYPE | ComplexType<any> | DefinePropTypeConfig> = V extends PROP_TYPE.BOOL ? true : V extends PROP_TYPE.NUMBER ? true : V extends PROP_TYPE.STRING ? true : V extends ComplexType<any> ? true : V extends DefineTypeConfig ? V extends ExactTypeHaver ? false : V['type'] extends PROP_TYPE.BOOL ? V extends Coerced ? false : V extends PreDefined ? false : true : V['type'] extends PROP_TYPE.NUMBER ? V extends Coerced ? false : V extends PreDefined ? false : true : V['type'] extends PROP_TYPE.STRING ? V extends Coerced ? false : V extends PreDefined ? false : true : V['type'] extends ComplexType<any> ? V extends PreDefined ? false : true : false : false;
declare type GetTSType<V extends PROP_TYPE | ComplexType<any> | DefinePropTypeConfig> = V extends PROP_TYPE.BOOL ? boolean : V extends PROP_TYPE.NUMBER ? number : V extends PROP_TYPE.STRING ? string : V extends ComplexType<infer R> ? R : V extends DefineTypeConfig ? V extends ExactTypeHaver ? V['exactType'] : V['type'] extends PROP_TYPE.BOOL ? V extends Coerced ? boolean : V extends PreDefined ? boolean : boolean : V['type'] extends PROP_TYPE.NUMBER ? V extends Coerced ? number : V extends PreDefined ? number : number : V['type'] extends PROP_TYPE.STRING ? V extends Coerced ? string : V extends PreDefined ? string : string : V['type'] extends ComplexType<infer R> ? V extends PreDefined ? R : R : void : void;
/**
 * Basic property types for properties
 */
export declare const enum PROP_TYPE {
    /**
     * A string
     */
    STRING = "string",
    /**
     * A number
     */
    NUMBER = "number",
    /**
     * A boolean
     */
    BOOL = "bool"
}
/**
 * A complex type for a property where the passed
 * template value is the actual type
 */
export declare type ComplexType<T> = typeof complex & {
    __data: T;
};
declare const complex: unique symbol;
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
export declare function ComplexType<T>(): ComplexType<T>;
declare type DefinePropTypes = PROP_TYPE | ComplexType<any>;
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
export declare function casingToDashes(name: string): string;
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
export declare function awaitConnected(el: HTMLElement): Promise<void>;
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
export declare function hookIntoConnect(el: HTMLElement, fn: () => any): Promise<void>;
/**
 * The type that can be passed to `Props.define(xxx, { })`
 */
export interface PropComponent extends HTMLElement {
    renderToDOM(changeType: number): void;
    getParentRef?(ref: string): any;
    isMounted: boolean;
    fire<EV extends keyof DEFAULT_EVENTS, R extends DEFAULT_EVENTS[EV]['returnType']>(event: EV | any, ...params: DEFAULT_EVENTS[EV]['args'] | any): R[];
    self: {
        mixins?: any[];
    } | any;
}
declare type _Remove<A extends {
    [key: string]: any;
}, B> = {
    [K in keyof A]: A[K] extends B ? never : K;
}[keyof A];
declare type RemoveType<A extends {
    [key: string]: any;
}, B> = {
    [K in _Remove<A, B>]: A[K];
};
interface PropTypeConfig {
    [key: string]: DefinePropTypes | DefinePropTypeConfig;
}
declare type ReturnType<R extends PropTypeConfig, P extends PropTypeConfig> = {
    [K in keyof RemoveType<{
        [K2 in keyof R]: IsUnassigned<R[K2]>;
    }, false>]?: GetTSType<R[K]>;
} & {
    [K in keyof Omit<R, keyof RemoveType<{
        [K2 in keyof R]: IsUnassigned<R[K2]>;
    }, false>>]: GetTSType<R[K]>;
} & {
    [K in keyof RemoveType<{
        [K2 in keyof P]: IsUnassigned<P[K2]>;
    }, false>]?: GetTSType<P[K]>;
} & {
    [K in keyof Omit<P, keyof RemoveType<{
        [K2 in keyof P]: IsUnassigned<P[K2]>;
    }, false>>]: GetTSType<P[K]>;
};
/**
 * The type of a prop config object. This is the value
 * that is passed to the `reflect` and `priv` keys
 */
export declare type PropConfigObject = {
    [key: string]: DefinePropTypes | DefinePropTypeConfig;
};
/**
 * The return type given the two prop config objects (
 * the public one and the private one))
 */
export declare type PropReturn<PUB extends PropConfigObject, PRIV extends PropConfigObject> = {
    [K in keyof PUB]: GetTSType<PUB[K]>;
} & {
    [K in keyof PRIV]: GetTSType<PRIV[K]>;
};
/**
 * A map of element tag names to prop configs
 */
export declare const propConfigs: Map<string, {
    reflect?: PropConfigObject;
    priv?: PropConfigObject;
}>;
/**
 * A class used to define properties for components
 */
export declare class Props {
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
    static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>>(element: PropComponent, props?: {
        reflect: PUB;
        priv: PRIV;
    }): Props & ReturnType<PUB, PRIV>;
    static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>>(element: PropComponent, props?: {
        priv: PRIV;
    }): Props & ReturnType<{}, PRIV>;
    static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>>(element: PropComponent, props?: {
        reflect: PUB;
    }): Props & ReturnType<PUB, {}>;
    static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>>(element: PropComponent, props?: {}): Props;
    static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>, PP extends PropReturn<any, any>>(element: PropComponent, props: {
        reflect: PUB;
        priv: PRIV;
    }, parentProps: PP): ReturnType<PUB, PRIV> & PP;
    static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>, PP extends PropReturn<any, any>>(element: PropComponent, props: {
        priv: PRIV;
    }, parentProps: PP): ReturnType<{}, PRIV> & PP;
    static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>, PP extends PropReturn<any, any>>(element: PropComponent, props: {
        reflect: PUB;
    }, parentProps: PP): Props & ReturnType<PUB, {}> & PP;
    static define<PUB extends PropConfigObject, PRIV extends PropConfigObject, R extends PropReturn<PUB, PRIV>, PP extends PropReturn<any, any>>(element: PropComponent, props: {}, parentProps: PP): Props & PP;
    /**
     * A function that will be called when the passed element
     * is connected to the dom (`connectedCallback` is called).
     * This is only used by the library and has no other uses.
     *
     * @param {HTMLElement} - The element that was connected
     */
    static onConnect(element: HTMLElement): void;
}
declare type DEFAULT_EVENTS = {
    beforePropChange: {
        args: [string, any, any];
        returnType: void;
    };
    propChange: {
        args: [string, any, any];
        returnType: void;
    };
};
export {};
//# sourceMappingURL=props.d.ts.map