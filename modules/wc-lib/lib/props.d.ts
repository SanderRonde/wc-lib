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
    type: DefinePropTypes;
}
/**
 * The type of a property's config object
 */
export interface DefinePropTypeConfig extends DefineTypeConfig {
    watch?: boolean;
    defaultValue?: GetTSType<this['type']>;
    value?: GetTSType<this['type']>;
    watchProperties?: string[];
    exactType?: any;
    coerce?: boolean;
    strict?: boolean;
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