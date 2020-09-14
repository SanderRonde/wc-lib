import { CHANGE_TYPE } from './template-fn.js';
import { createWatchable, Watchable } from './util/manual.js';

/**
 * The prefix used for complex references
 *
 * @constant
 */
export const refPrefix = '___complex_ref';

function getterWithVal<R>(
    component: {
        getParentRef?(ref: string): any;
    },
    value: string | null,
    strict: boolean,
    type: 'string' | 'number' | 'bool' | ComplexTypeClass<any>
): boolean | string | number | undefined | R;
function getterWithVal(
    component: {
        getParentRef?(ref: string): any;
    },
    value: string | null,
    strict: boolean,
    type: 'bool'
): boolean;
function getterWithVal(
    component: {
        getParentRef?(ref: string): any;
    },
    value: string | null,
    strict: boolean,
    type: 'string'
): string | undefined;
function getterWithVal(
    component: {
        getParentRef?(ref: string): any;
    },
    value: string | null,
    strict: boolean,
    type: 'number'
): number | undefined;
function getterWithVal<R>(
    component: {
        getParentRef?(ref: string): any;
    },
    value: string | null,
    strict: boolean,
    type: ComplexTypeClass<any>
): R | undefined;
function getterWithVal<R>(
    component: {
        getParentRef?(ref: string): any;
    },
    value: string | null,
    strict: boolean,
    type: 'string' | 'number' | 'bool' | ComplexTypeClass<any>
): boolean | string | number | undefined | R {
    if (type === 'bool') {
        if (strict) {
            return value + '' === 'true';
        }
        return value !== undefined && value !== null && value !== 'false';
    } else {
        /* istanbul ignore else */
        if (value !== undefined && value !== null && value !== 'false') {
            if (type === 'number') {
                return ~~value;
            } else if (type instanceof ComplexTypeClass) {
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
                    } catch (e) {
                        console.warn(
                            'Failed to parse complex JSON value',
                            decodeURIComponent(value)
                        );
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
 * @param {'string'|'number'|'bool'|ComplexTypeClass<any>} type - The
 * 	type of the value
 *
 * @returns {boolean|string|number|undefined|R} The value
 */
export function getter<R>(
    element: HTMLElementAttributes & {
        getParentRef?(ref: string): any;
    },
    name: string,
    strict: boolean,
    type: 'string' | 'number' | 'bool' | ComplexTypeClass<any>
): boolean | string | number | undefined | R;
export function getter(
    element: HTMLElementAttributes & {
        getParentRef?(ref: string): any;
    },
    name: string,
    strict: boolean,
    type: 'bool'
): boolean;
export function getter(
    element: HTMLElementAttributes & {
        getParentRef?(ref: string): any;
    },
    name: string,
    strict: boolean,
    type: 'string'
): string | undefined;
export function getter(
    element: HTMLElementAttributes & {
        getParentRef?(ref: string): any;
    },
    name: string,
    strict: boolean,
    type: 'number'
): number | undefined;
export function getter<R>(
    element: HTMLElementAttributes & {
        getParentRef?(ref: string): any;
    },
    name: string,
    strict: boolean,
    type: ComplexTypeClass<any>
): R | undefined;
export function getter<R>(
    element: HTMLElementAttributes & {
        getParentRef?(ref: string): any;
    },
    name: string,
    strict: boolean,
    type: 'string' | 'number' | 'bool' | ComplexTypeClass<any>
): boolean | string | number | undefined | R {
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
 * @param {'string'|'number'|'bool'|ComplexTypeClass<any>} type - The
 * 	type of the value
 */
export function setter(
    setAttrFn: (key: string, val: string) => void,
    removeAttrFn: (key: string) => void,
    name: string,
    value: string | boolean | number,
    type: 'string' | 'number' | 'bool' | ComplexTypeClass<any>
): void;
export function setter(
    setAttrFn: (key: string, val: string) => void,
    removeAttrFn: (key: string) => void,
    name: string,
    value: any,
    type: ComplexTypeClass<any>
): void;
export function setter(
    setAttrFn: (key: string, val: string) => void,
    removeAttrFn: (key: string) => void,
    name: string,
    value: boolean,
    type: 'bool'
): void;
export function setter(
    setAttrFn: (key: string, val: string) => void,
    removeAttrFn: (key: string) => void,
    name: string,
    value: string,
    type: 'string'
): void;
export function setter(
    setAttrFn: (key: string, val: string) => void,
    removeAttrFn: (key: string) => void,
    name: string,
    value: number,
    type: 'number'
): void;
export function setter(
    setAttrFn: (key: string, val: string) => void,
    removeAttrFn: (key: string) => void,
    name: string,
    value: string | boolean | number,
    type: 'string' | 'number' | 'bool' | ComplexTypeClass<any>
): void {
    if (type === 'bool') {
        const boolVal = value as boolean;
        if (boolVal) {
            setAttrFn(name, '');
        } else {
            removeAttrFn(name);
        }
    } else {
        const strVal = value as string | number;
        if (type instanceof ComplexTypeClass) {
            try {
                setAttrFn(name, encodeURIComponent(JSON.stringify(strVal)));
            } catch (e) {
                // istanbul ignore next
                setAttrFn(name, encodeURIComponent('_'));
            }
        } else {
            setAttrFn(name, String(strVal));
        }
    }
}

interface ExactTypeHaver {
    exactType: any;
}

interface Coerced {
    coerce: true;
}

type PreDefined =
    | {
          value: any;
      }
    | {
          defaultValue: any;
      }
    | {
          isDefined: true;
      }
    | {
          required: true;
      };

type OptionalConfig =
    | {
          isDefined: false;
      }
    | {
          required: false;
      };

export type GetComplexTypeClassSpec<V> = V extends ComplexTypeClass<
    any,
    infer S
>
    ? S
    : void;

type IsUnassigned<
    V extends PROP_TYPE | ComplexTypeClass<any> | DefinePropTypeConfig
> = V extends PROP_TYPE.BOOL | PROP_TYPE.NUMBER | PROP_TYPE.STRING // params, unassigned // If type is one of the basic types with no further // Or a complex type with optional or unspecified, unassigned
    ? true // If a complex type with required, assigned
    : V extends ComplexTypeClass<any, any>
    ? GetComplexTypeClassSpec<V> extends 'optional' | 'unspecified'
        ? true
        : false
    : V extends  // If a basic type but required, unassigned
          | PROP_TYPE.STRING_REQUIRED
          | PROP_TYPE.NUMBER_REQUIRED
          | PROP_TYPE.BOOL_REQUIRED
    ? false
    : V extends  // If a basic type but optional, assigned
          | PROP_TYPE.STRING_OPTIONAL
          | PROP_TYPE.NUMBER_OPTIONAL
          | PROP_TYPE.BOOL_OPTIONAL
    ? true // If it has a config at all, look further, // otherwise it's unassigned
    : V extends DefineTypeConfig // Check if it has an exact type
    ? V extends ExactTypeHaver // If it does, if the exact type is assignable // to void|undefined, it's unassigned, otherwise // not
        ? V['exactType'] extends undefined | void
            ? true
            : false
        : V['type'] extends  // If a basic type but required, assigned
              | PROP_TYPE.STRING_REQUIRED
              | PROP_TYPE.NUMBER_REQUIRED
              | PROP_TYPE.BOOL_REQUIRED
        ? false
        : V['type'] extends ComplexTypeClass<any, any>
        ? GetComplexTypeClassSpec<V['type']> extends 'required'
            ? false
            : V['type'] extends  // If a basic type but optional, unassigned
                  | PROP_TYPE.STRING_OPTIONAL
                  | PROP_TYPE.NUMBER_OPTIONAL
                  | PROP_TYPE.BOOL_OPTIONAL
            ? true // If another type with no requiredness specified
            : V['type'] extends ComplexTypeClass<any, any>
            ? GetComplexTypeClassSpec<V['type']> extends 'optional'
                ? true
                : V['type'] extends
                      | PROP_TYPE.BOOL
                      | PROP_TYPE.NUMBER
                      | PROP_TYPE.STRING
                      | ComplexTypeClass<any> // If it has optional in the config, unassigned
                ? V extends OptionalConfig
                    ? true // If it has defined in the config, assigned
                    : V extends PreDefined
                    ? false // If coerced, always assigned
                    : V extends Coerced
                    ? false
                    : true
                : false
            : V['type'] extends
                  | PROP_TYPE.BOOL
                  | PROP_TYPE.NUMBER
                  | PROP_TYPE.STRING
                  | ComplexTypeClass<any> // If it has optional in the config, unassigned
            ? V extends OptionalConfig
                ? true // If it has defined in the config, assigned
                : V extends PreDefined
                ? false // If coerced, always assigned
                : V extends Coerced
                ? false
                : true
            : false
        : V['type'] extends  // If a basic type but optional, unassigned
              | PROP_TYPE.STRING_OPTIONAL
              | PROP_TYPE.NUMBER_OPTIONAL
              | PROP_TYPE.BOOL_OPTIONAL
        ? true // If another type with no requiredness specified
        : V['type'] extends ComplexTypeClass<any, any>
        ? GetComplexTypeClassSpec<V['type']> extends 'optional'
            ? true
            : V['type'] extends
                  | PROP_TYPE.BOOL
                  | PROP_TYPE.NUMBER
                  | PROP_TYPE.STRING
                  | ComplexTypeClass<any> // If it has optional in the config, unassigned
            ? V extends OptionalConfig
                ? true // If it has defined in the config, assigned
                : V extends PreDefined
                ? false // If coerced, always assigned
                : V extends Coerced
                ? false
                : true
            : false
        : V['type'] extends
              | PROP_TYPE.BOOL
              | PROP_TYPE.NUMBER
              | PROP_TYPE.STRING
              | ComplexTypeClass<any> // If it has optional in the config, unassigned
        ? V extends OptionalConfig
            ? true // If it has defined in the config, assigned
            : V extends PreDefined
            ? false // If coerced, always assigned
            : V extends Coerced
            ? false
            : true
        : false
    : true;

/**
 * Gets the type of an individual property based on its config
 */
export type GetTSType<
    V extends PROP_TYPE | ComplexTypeClass<any> | DefinePropTypeConfig
> = V extends PROP_TYPE.BOOL | PROP_TYPE.BOOL_OPTIONAL | PROP_TYPE.BOOL_REQUIRED
    ? boolean
    : V extends
          | PROP_TYPE.NUMBER
          | PROP_TYPE.NUMBER_OPTIONAL
          | PROP_TYPE.NUMBER_REQUIRED
    ? number
    : V extends
          | PROP_TYPE.STRING
          | PROP_TYPE.STRING_OPTIONAL
          | PROP_TYPE.STRING_REQUIRED
    ? string
    : V extends ComplexTypeClass<infer R>
    ? R
    : V extends DefineTypeConfig
    ? V extends ExactTypeHaver
        ? V['exactType']
        : V['type'] extends
              | PROP_TYPE.BOOL
              | PROP_TYPE.BOOL_OPTIONAL
              | PROP_TYPE.BOOL_REQUIRED
        ? V extends Coerced
            ? boolean
            : V extends PreDefined
            ? boolean
            : boolean
        : V['type'] extends
              | PROP_TYPE.NUMBER
              | PROP_TYPE.NUMBER_OPTIONAL
              | PROP_TYPE.NUMBER_REQUIRED
        ? V extends Coerced
            ? number
            : V extends PreDefined
            ? number
            : number
        : V['type'] extends
              | PROP_TYPE.STRING
              | PROP_TYPE.STRING_OPTIONAL
              | PROP_TYPE.STRING_REQUIRED
        ? V extends Coerced
            ? string
            : V extends PreDefined
            ? string
            : string
        : V['type'] extends ComplexTypeClass<infer R>
        ? V extends PreDefined
            ? R
            : R
        : void
    : void;

const enum NARROWED_PROP_TYPE {
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
    BOOL = 'bool',
}

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
    BOOL = 'bool',
    /**
     * A required string (shortcut for {type: PROP_TYPE.STRING, required: true })
     */
    STRING_REQUIRED = 'string_required',
    /**
     * A required number (shortcut for {type: PROP_TYPE.NUMBER, required: true })
     */
    NUMBER_REQUIRED = 'number_required',
    /**
     * A required boolean (shortcut for {type: PROP_TYPE.BOOL, required: true })
     */
    BOOL_REQUIRED = 'bool_required',
    /**
     * An optional string (shortcut for {type: PROP_TYPE.STRING, required: false })
     */
    STRING_OPTIONAL = 'string_optional',
    /**
     * An optional number (shortcut for {type: PROP_TYPE.NUMBER, required: false })
     */
    NUMBER_OPTIONAL = 'number_optional',
    /**
     * An optional boolean (shortcut for {type: PROP_TYPE.BOOL, required: false })
     */
    BOOL_OPTIONAL = 'bool_optional',
}

/**
 * A complex type for a property where the passed
 * template value is the actual type
 */
export type ComplexType<T> = ComplexTypeClass<any> & {
    __data: T;
};

export class ComplexTypeClass<
    _T,
    _R extends 'required' | 'optional' | 'unspecified' = 'unspecified'
> {
    // istanbul ignore next
    required(): ComplexTypeClass<_T, 'required'> {
        // istanbul ignore next
        return this as ComplexTypeClass<_T, 'required'>;
    }

    // istanbul ignore next
    optional(): ComplexTypeClass<_T, 'optional'> {
        // istanbul ignore next
        return this as ComplexTypeClass<_T, 'optional'>;
    }
}

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
export function ComplexType<T>(): ComplexTypeClass<T> {
    return new ComplexTypeClass<T>();
}

/**
 * A simple prop config that uses a type
 */
export type DefinePropTypes = PROP_TYPE | ComplexTypeClass<any>;

interface DefineTypeConfig {
    /**
     * The type of this property. Can either by a PROP_TYPE:
     * PROP_TYPE.STRING, PROP_TYPE.NUMBER or PROP_TYPE.BOOL (or their
     * _OPTIONAL and _REQUIRED variants),
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
    /**
     * If true, the type of this property is assumed to be defined
     * even if no default value was provided. This is basically
     * the equivalent of doing `this.props.x!` in typescript.
     * This value is not actually used in any way except for typing.
     */
    isDefined?: boolean;
    /**
     * Whether this parameter is required. False by default.
     * Currently only affects the JSX typings.
     * This value is not actually used in any way except for typing.
     */
    required?: boolean;
    /**
     * A description for this parameter
     */
    description?: string;
}

/**
 * Get the prop config from a propconfig property.
 * Converts the type|config format to always be config
 *
 * @param {DefinePropTypes | DefinePropTypeConfig} value - The
 *  value to check
 *
 * @returns {DefinePropTypeConfig} A prop config object
 */
export function getDefinePropConfig(
    value: DefinePropTypes | DefinePropTypeConfig
): DefinePropTypeConfig {
    if (typeof value === 'object' && 'type' in value) {
        const data = value as DefinePropTypeConfig;
        return data;
    } else {
        return {
            coerce: false,
            watch: true,
            strict: false,
            reflectToSelf: true,
            type: value as DefinePropTypes,
        };
    }
}

namespace Watching {
    type PathLevel = Map<
        string | '*' | '**',
        {
            name: string | '*' | '**';
            relevantPaths: string[][];
            map: PathLevel;
            watchCurrent: boolean;
        }
    >;

    function genProxyStructureLevel(pathParts: string[][]): PathLevel {
        const currentLevel: PathLevel = new Map();
        for (const path of pathParts) {
            if (!currentLevel.has(path[0])) {
                currentLevel.set(path[0], {
                    name: path[0],
                    relevantPaths: [],
                    watchCurrent: path.length === 1,
                    map: new Map(),
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
        for (const [name, level] of currentLevel) {
            if (name === '*') {
                // Merge this level's paths into others' paths
                for (const otherLevel of currentLevel.values()) {
                    if (otherLevel.map === level.map) continue;

                    otherLevel.relevantPaths.push(...level.relevantPaths);
                }
            }
        }

        // Dedupe the relevant paths
        for (const [, level] of currentLevel) {
            level.relevantPaths = level.relevantPaths.filter((val, index) => {
                return level.relevantPaths.indexOf(val) === index;
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

        for (const [, level] of currentLevel) {
            level.map = genProxyStructureLevel(
                level.relevantPaths
                    .map((p) => p.slice(1))
                    .filter((p) => p.length)
            );
        }

        return currentLevel;
    }

    function getProxyStructure(paths: string[]): PathLevel {
        const pathParts = paths.map((p) => p.split('.'));

        for (const path of pathParts) {
            for (const pathPart of path) {
                if (pathPart === '**') {
                    const retMap = new Map();
                    retMap.set('**', {
                        name: '**',
                        map: new Map(),
                    });
                    return retMap;
                }
            }
        }

        return genProxyStructureLevel(pathParts);
    }

    function canWatchValue(value: any) {
        return (
            typeof value === 'object' &&
            !(value instanceof Date) &&
            !(value instanceof RegExp)
        );
    }

    function createDeepProxy(obj: any, onAccessed: () => void) {
        const isArr = Array.isArray(obj);

        const proxy = new Proxy(obj, {
            set(_obj, prop, value) {
                const isPropChange = (() => {
                    if (isArr) {
                        if (typeof prop === 'symbol') return true;
                        if (
                            typeof prop === 'number' ||
                            !Number.isNaN(parseInt(prop))
                        ) {
                            return true;
                        }
                        return false;
                    } else {
                        return true;
                    }
                })();

                if (isPropChange) {
                    if (canWatchValue(value) && value !== null) {
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
            },
        });
        for (const key of Object.keys(obj)) {
            if (canWatchValue(obj[key])) {
                obj[key] = createDeepProxy(obj[key], onAccessed);
            }
        }
        return proxy;
    }

    function watchObjectLevel(
        obj: any,
        level: PathLevel,
        onAccessed: () => void
    ) {
        if (!obj) return obj;

        const isArr = Array.isArray(obj);

        const proxy = new Proxy(obj, {
            set(_obj, prop, value) {
                const isPropChange = (() => {
                    if (isArr) {
                        if (level.has('*')) {
                            if (typeof prop === 'symbol') return true;
                            return (
                                typeof prop === 'number' ||
                                !Number.isNaN(parseInt(prop))
                            );
                        }
                        if (
                            typeof prop !== 'symbol' &&
                            level.has(prop + '') &&
                            level.get(prop + '')!.watchCurrent
                        ) {
                            return true;
                        }
                        return false;
                    } else {
                        if (typeof prop !== 'symbol') {
                            return (
                                (level.get(prop + '') &&
                                    level.get(prop + '')!.watchCurrent) ||
                                (level.get('*') && level.get('*')!.watchCurrent)
                            );
                        }
                        return level.has('*') && level.get('*')!.watchCurrent;
                    }
                })();
                if (isPropChange) {
                    const nextLevel =
                        (typeof prop !== 'symbol' && level.get(prop + '')) ||
                        level.get('*')!;

                    if (nextLevel.map.size && canWatchValue(value)) {
                        // Watch this as well
                        value = watchObjectLevel(
                            value,
                            nextLevel.map,
                            onAccessed
                        );
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
                    if (
                        deleted &&
                        ((typeof prop !== 'symbol' && level.has(prop + '')) ||
                            level.has('*'))
                    ) {
                        onAccessed();
                    }
                    return deleted;
                }
                return true;
            },
        });
        for (const name of Object.keys(obj)) {
            if (
                (level.has(name) || level.has('*')) &&
                canWatchValue(obj[name])
            ) {
                obj[name] = watchObjectLevel(
                    obj[name],
                    (level.get(name) || level.get('*')!).map,
                    onAccessed
                );
            }
        }
        return proxy;
    }

    function watchObject(
        obj: any,
        properties: PathLevel,
        callback: () => void
    ) {
        if (
            typeof obj !== 'object' ||
            obj === undefined ||
            obj === null ||
            (typeof HTMLElement !== 'undefined' && obj instanceof HTMLElement)
        ) {
            return obj;
        }
        if (typeof Proxy === 'undefined') {
            console.warn(
                'Attempted to watch object while proxy method is not supported'
            );
            return obj;
        }

        if (properties.has('**')) {
            return createDeepProxy(obj, callback);
        } else {
            return watchObjectLevel(obj, properties, callback);
        }
    }

    type QueueRenderFn = (changeType: CHANGE_TYPE) => void;

    export function watchValue(
        render: QueueRenderFn,
        value: any,
        watch: boolean,
        watchProperties: string[]
    ) {
        if (canWatchValue(value) && (watch || watchProperties.length > 0)) {
            value = watchObject(
                value,
                watchProperties.length
                    ? getProxyStructure(watchProperties)
                    : new Map([
                          [
                              '*',
                              {
                                  name: '*',
                                  relevantPaths: [],
                                  watchCurrent: true,
                                  map: new Map(),
                              },
                          ],
                      ]),
                () => {
                    render(CHANGE_TYPE.PROP);
                }
            );
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

function getNarrowedType<O>(propType: PROP_TYPE | O): NARROWED_PROP_TYPE | O {
    switch (propType) {
        case PROP_TYPE.STRING:
        case PROP_TYPE.STRING_OPTIONAL:
        case PROP_TYPE.STRING_REQUIRED:
            return NARROWED_PROP_TYPE.STRING;
        case PROP_TYPE.BOOL:
        case PROP_TYPE.BOOL_OPTIONAL:
        case PROP_TYPE.BOOL_REQUIRED:
            return NARROWED_PROP_TYPE.BOOL;
        case PROP_TYPE.NUMBER:
        case PROP_TYPE.NUMBER_OPTIONAL:
        case PROP_TYPE.NUMBER_REQUIRED:
            return NARROWED_PROP_TYPE.NUMBER;
    }
    return propType;
}

function getCoerced(initial: any, mapType: DefinePropTypes) {
    switch (getNarrowedType(mapType)) {
        case NARROWED_PROP_TYPE.STRING:
            return initial || '';
        case NARROWED_PROP_TYPE.BOOL:
            return initial || false;
        case NARROWED_PROP_TYPE.NUMBER:
            return initial || 0;
    }
    return initial;
}

const connectMap = new WeakMap<HTMLElementAttributes, any>();
const connectedElements = new WeakSet<HTMLElementAttributes>();

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
export async function hookIntoConnect(
    el: HTMLElement,
    fn: () => any
): Promise<void> {
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

type HTMLElementAttributes = Pick<
    HTMLElement,
    | 'setAttribute'
    | 'removeAttribute'
    | 'hasAttribute'
    | 'getAttribute'
    | 'tagName'
>;

/**
 * The type that can be passed to `Props.define(xxx, { })`
 */
export interface PropComponent extends HTMLElementAttributes {
    renderToDOM(changeType: number): void;
    getParentRef?(ref: string): any;
    isMounted: boolean;
    readonly isSSR?: boolean;
    fire<EV extends keyof PROP_EVENTS, R extends PROP_EVENTS[EV]['returnType']>(
        event: EV | any,
        ...params: PROP_EVENTS[EV]['args'] | any
    ): R[];
    self:
        | {
              mixins?: any[];
          }
        | any;
}

type _Remove<
    A extends {
        [key: string]: any;
    },
    B
> = {
    [K in keyof A]: A[K] extends B ? never : K;
}[keyof A];

type RemoveType<
    A extends {
        [key: string]: any;
    },
    B
> = {
    [K in _Remove<A, B>]: A[K];
};

// Reflect and private type configs
interface PropTypeConfig {
    [key: string]: DefinePropTypes | DefinePropTypeConfig;
}
type ReturnType<R extends PropTypeConfig, P extends PropTypeConfig> = {
    [K in keyof RemoveType<
        {
            [K2 in keyof R]: IsUnassigned<R[K2]>;
        },
        false
    >]?: GetTSType<R[K]>;
} &
    {
        [K in keyof Omit<
            R,
            keyof RemoveType<
                {
                    [K2 in keyof R]: IsUnassigned<R[K2]>;
                },
                false
            >
        >]: GetTSType<R[K]>;
    } &
    {
        [K in keyof RemoveType<
            {
                [K2 in keyof P]: IsUnassigned<P[K2]>;
            },
            false
        >]?: GetTSType<P[K]>;
    } &
    {
        [K in keyof Omit<
            P,
            keyof RemoveType<
                {
                    [K2 in keyof P]: IsUnassigned<P[K2]>;
                },
                false
            >
        >]: GetTSType<P[K]>;
    };
type SimpleReturnType<R extends PropTypeConfig, P extends PropTypeConfig> = {
    [K in keyof P]: GetTSType<P[K]>;
} &
    {
        [K in keyof R]: GetTSType<R[K]>;
    } &
    Props<any>;

namespace PropsDefiner {
    type KeyPart<C extends PropTypeConfig, B extends boolean> = {
        key: Extract<keyof C, string>;
        value: C[keyof C];
        reflectToAttr: B;
    };
    type Keys<R extends PropTypeConfig, P extends PropTypeConfig> = (
        | KeyPart<R, true>
        | KeyPart<P, false>
    )[];

    const renderMap: WeakMap<PropComponent, CHANGE_TYPE> = new WeakMap();

    function queueRender(
        element: ElementRepresentation<any, any>,
        changeType: CHANGE_TYPE,
        changeKey?: string
    ) {
        if (!renderMap.has(element.component)) {
            renderMap.set(element.component, changeType);
        }

        // setTimeout(() => {
        element.component.renderToDOM(renderMap.get(element.component)!);
        element.changeListeners.forEach((l) => l(changeKey));
        renderMap.delete(element.component);
        // }, 0);
    }

    function createQueueRenderFn(
        element: ElementRepresentation<any, any>,
        changeKey?: string
    ) {
        return (changeType: CHANGE_TYPE) => {
            queueRender(element, changeType, changeKey);
        };
    }

    class ElementRepresentation<
        R extends PropTypeConfig,
        P extends PropTypeConfig
    > {
        public setAttr: (name: string, value: string) => void;
        public removeAttr: (name: string) => void;
        public keyMap: Map<
            Extract<keyof R | keyof P, string>,
            {
                watch: boolean;
                coerce: boolean;
                mapType: DefinePropTypes;
                reflectToAttr: boolean;
                strict: boolean;
            }
        > = new Map();
        public propValues: Partial<SimpleReturnType<R, P>> = {};
        public onConnectMap: Map<
            Extract<keyof R | keyof P, string>,
            () => void
        > = new Map();
        public onDone: Promise<void>;
        private _onDoneResolve!: () => void;
        public changeListeners: ((changedKey?: string) => void)[] = [];

        constructor(public component: PropComponent) {
            this.setAttr = component.setAttribute.bind(component);
            this.removeAttr = component.removeAttribute.bind(component);
            this.onDone = new Promise((resolve) => {
                this._onDoneResolve = resolve;
            });
        }

        public overrideAttributeFunctions() {
            this.component.setAttribute = (key: string, val: string) => {
                if (!this.component.isMounted) {
                    this.onConnect(
                        dashesToCasing(key) as Extract<
                            keyof R | keyof P,
                            string
                        >,
                        () => {
                            onSetAttribute(key, val, this);
                        },
                        true
                    );
                    this.setAttr(key, val);
                    return;
                }

                onSetAttribute(key, val, this);
            };
            this.component.removeAttribute = (key: string) => {
                if (!this.component.isMounted) {
                    this.onConnect(
                        dashesToCasing(key) as Extract<
                            keyof R | keyof P,
                            string
                        >,
                        () => {
                            onRemoveAttribute(key, this);
                        },
                        true
                    );
                    this.removeAttr(key);
                    return;
                }

                onRemoveAttribute(key, this);
            };
        }

        public onConnect(
            key: Extract<keyof R | keyof P, string>,
            listener: () => void,
            force: boolean
        ) {
            if (connectedElements.has(this.component)) {
                listener();
                return;
            }

            if (this.onConnectMap.has(key) && !force) return;
            this.onConnectMap.set(key, listener);
        }

        public connected() {
            [...this.onConnectMap.values()].forEach((listener) => {
                listener();
            });
            this._onDoneResolve();
            if (!this.component.isSSR) {
                queueRender(this, CHANGE_TYPE.PROP);
            }
        }
    }

    function getKeys<R extends PropTypeConfig, P extends PropTypeConfig>({
        reflect = {} as R,
        priv = {} as P,
    }: {
        reflect?: R;
        priv?: P;
    }): Keys<R, P> {
        return [
            ...(Object.getOwnPropertyNames(reflect).map((key) => {
                return {
                    key: key as Extract<keyof R, string>,
                    value: reflect[key],
                    reflectToAttr: true,
                };
            }) as KeyPart<R, true>[]),
            ...(Object.getOwnPropertyNames(priv).map((key) => {
                return {
                    key: key as Extract<keyof P, string>,
                    value: priv[key],
                    reflectToAttr: false,
                };
            }) as KeyPart<P, false>[]),
        ];
    }

    function onSetAttribute<R extends PropTypeConfig, P extends PropTypeConfig>(
        key: string,
        val: string,
        el: ElementRepresentation<R, P>
    ) {
        const casingKey = dashesToCasing(key) as Extract<
            keyof R | keyof P,
            string
        >;
        if (el.keyMap.has(casingKey)) {
            const { watch, mapType, strict } = el.keyMap.get(casingKey)!;

            const prevVal = el.propValues[casingKey];
            const newVal = getterWithVal(
                el.component,
                val,
                strict,
                getNarrowedType(mapType)
            );

            if (prevVal === newVal) return;

            el.component.fire('beforePropChange', casingKey, newVal, prevVal);
            el.propValues[casingKey] = newVal as any;
            el.component.fire('propChange', casingKey, newVal, prevVal);

            if (watch) {
                queueRender(el, CHANGE_TYPE.PROP, casingKey);
            }
        } else {
            el.propValues[casingKey] = val as any;
        }
        el.setAttr(key, val);
    }

    function onRemoveAttribute<
        R extends PropTypeConfig,
        P extends PropTypeConfig
    >(key: string, el: ElementRepresentation<R, P>) {
        const casingKey = dashesToCasing(key) as Extract<
            keyof R | keyof P,
            string
        >;
        if (el.keyMap.has(casingKey)) {
            const { watch, coerce, mapType } = el.keyMap.get(casingKey)!;

            const prevVal = el.propValues[casingKey];
            const newVal = (() => {
                if (coerce) {
                    return getCoerced(undefined, mapType);
                }
                if (getNarrowedType(mapType) === NARROWED_PROP_TYPE.BOOL) {
                    return false;
                }
                return undefined;
            })();

            if (prevVal !== newVal) {
                el.component.fire(
                    'beforePropChange',
                    casingKey,
                    newVal,
                    prevVal
                );
                el.propValues[casingKey] = newVal;
                el.component.fire('propChange', casingKey, newVal, prevVal);
                el.changeListeners.forEach((l) => l(casingKey));

                if (watch) {
                    queueRender(el, CHANGE_TYPE.PROP, casingKey);
                }
            }
        }
        el.removeAttr(key);
    }

    const elementConfigs: WeakMap<
        Props,
        {
            element: ElementRepresentation<PropTypeConfig, PropTypeConfig>;
            composite: boolean;
        }
    > = new WeakMap();

    interface PropConfig<R, P>
        extends Omit<
            Required<DefinePropTypeConfig>,
            'value' | 'exactType' | 'isDefined' | 'required'
        > {
        mapKey: Extract<keyof P | keyof R, string>;
        key: string;
        reflectToAttr: boolean;
        propName: string;
    }

    class Property<
        R extends PropTypeConfig,
        P extends PropTypeConfig,
        K extends KeyPart<R, true> | KeyPart<P, false>,
        Z extends ReturnType<R, P>
    > {
        constructor(
            private _propertyConfig: K,
            private _rep: ElementRepresentation<R, P>,
            private _props: Props & Partial<Z>
        ) {}

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
                reflectToSelf = true,
                description,
            } = getDefinePropConfig(value);
            return {
                watch,
                coerce,
                type,
                strict,
                watchProperties,
                reflectToSelf,
                mapKey: mapKey as any,
                key,
                reflectToAttr,
                propName,
                defaultValue:
                    defaultValue !== undefined ? defaultValue : defaultValue2,
                description: description || '',
            };
        }

        private __config: PropConfig<P, R> | null = null;
        public get config() {
            if (this.__config) {
                return this.__config;
            }
            return (this.__config = this.__getConfig());
        }

        public setKeyMap(
            keyMap: Map<
                Extract<keyof R | keyof P, string>,
                {
                    watch: boolean;
                    coerce: boolean;
                    mapType: DefinePropTypes;
                    strict: boolean;
                    reflectToAttr: boolean;
                }
            >
        ) {
            const { key } = this._propertyConfig;
            const {
                watch,
                coerce,
                type: mapType,
                strict,
                reflectToAttr,
            } = this.config;

            keyMap.set(key, {
                watch,
                coerce,
                mapType,
                strict,
                reflectToAttr,
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
                enumerable: true,
                set(value) {
                    const props = _this._props as SimpleReturnType<R, P>;
                    if (props[mapKey] === value) return;
                    props[mapKey] = value;
                },
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
                mapKey,
                coerce,
                type,
                key,
                watch,
                watchProperties,
                propName,
            } = this.config;
            Object.defineProperty(this._props, mapKey, {
                get() {
                    const value = _this._rep.propValues[mapKey];
                    if (coerce) {
                        return getCoerced(value, type);
                    }
                    return value;
                },
                enumerable: true,
                set(value) {
                    const original = value;
                    value = Watching.watchValue(
                        createQueueRenderFn(_this._rep, mapKey),
                        value,
                        watch,
                        watchProperties
                    );

                    if (
                        (<SimpleReturnType<R, P>>_this._props)[mapKey] === value
                    )
                        return;
                    const prevVal = _this._rep.propValues[mapKey];
                    _this._rep.component.fire(
                        'beforePropChange',
                        key,
                        value,
                        prevVal
                    );
                    _this._rep.propValues[mapKey] = value;
                    _this._rep.component.fire(
                        'propChange',
                        key,
                        value,
                        prevVal
                    );
                    _this._rep.changeListeners.forEach((l) => l(key));
                    if (_this._propertyConfig.reflectToAttr) {
                        setter(
                            _this._rep.setAttr,
                            _this._rep.removeAttr,
                            propName,
                            original,
                            getNarrowedType(type)
                        );
                    }

                    if (watch) {
                        queueRender(_this._rep, CHANGE_TYPE.PROP, mapKey);
                    }
                },
            });
        }

        public async assignComplexType() {
            const {
                type,
                mapKey,
                propName,
                strict,
                watch,
                watchProperties,
            } = this.config;
            this._rep.onConnect(
                mapKey,
                () => {
                    this._rep.propValues[mapKey] = Watching.watchValue(
                        createQueueRenderFn(this._rep, mapKey),
                        this._rep.component.hasAttribute(propName)
                            ? (getter(
                                  this._rep.component,
                                  propName,
                                  strict,
                                  getNarrowedType(type)
                              ) as any)
                            : undefined,
                        watch,
                        watchProperties
                    );
                },
                false
            );
        }

        public assignSimpleType() {
            const {
                type,
                mapKey,
                propName,
                strict,
                watch,
                watchProperties,
            } = this.config;
            this._rep.propValues[mapKey] = Watching.watchValue(
                createQueueRenderFn(this._rep, mapKey),
                this._rep.component.hasAttribute(propName) ||
                    (strict && type === 'bool')
                    ? (getter(
                          this._rep.component,
                          propName,
                          strict,
                          getNarrowedType(type)
                      ) as any)
                    : undefined,
                watch,
                watchProperties
            );
        }

        public doDefaultAssign() {
            const {
                defaultValue,
                mapKey,
                watch,
                watchProperties,
                propName,
                type,
                reflectToAttr,
            } = this.config;
            if (defaultValue !== undefined) {
                if (this._rep.propValues[mapKey] === undefined) {
                    this._rep.propValues[mapKey] = Watching.watchValue(
                        createQueueRenderFn(this._rep, mapKey),
                        defaultValue as any,
                        watch,
                        watchProperties
                    );
                }
                if (reflectToAttr) {
                    setter(
                        this._rep.setAttr,
                        this._rep.removeAttr,
                        propName,
                        this._rep.propValues[mapKey],
                        type as any
                    );
                }
            } else if (type instanceof ComplexTypeClass && reflectToAttr) {
                setter(
                    this._rep.setAttr,
                    this._rep.removeAttr,
                    propName,
                    this._rep.propValues[mapKey] as any,
                    type
                );
            }
        }
    }

    function defineProperties<
        R extends PropTypeConfig,
        P extends PropTypeConfig,
        Z extends ReturnType<R, P>
    >(
        element: ElementRepresentation<PropTypeConfig, PropTypeConfig>,
        props: Props & Partial<Z>,
        config: {
            reflect?: R;
            priv?: P;
        }
    ) {
        const keys = getKeys(config);
        const properties = keys.map((key) => new Property(key, element, props));
        properties.forEach((property) => property.setKeyMap(element.keyMap));
        properties.forEach((property) => property.setReflect());
        properties.forEach((property) => property.setPropAccessors());
        return Promise.all(
            properties.map(
                (property): Promise<void | void[]> => {
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
                    if (!(property.config.type instanceof ComplexTypeClass)) {
                        property.assignSimpleType();
                        element.onConnect(
                            property.config.mapKey,
                            () => {
                                property.doDefaultAssign();
                            },
                            false
                        );
                        return element.onDone;
                    }

                    element.onConnect(
                        property.config.mapKey,
                        () => {
                            property.assignComplexType();
                            property.doDefaultAssign();
                        },
                        false
                    );
                    return element.onDone;
                }
            )
        );
    }

    export function define<
        R extends PropTypeConfig,
        P extends PropTypeConfig,
        Z extends ReturnType<R, P>
    >(
        props: Props & Partial<Z>,
        component: PropComponent,
        config: {
            reflect?: R;
            priv?: P;
        }
    ) {
        const element = new ElementRepresentation(component);

        element.overrideAttributeFunctions();
        if (component.isSSR) {
            element.connected();
            connectedElements.add(component);
        } else {
            hookIntoConnect(component as any, () => {
                element.connected();
            });
        }

        elementConfigs.set(props, {
            composite: false,
            element,
        });

        return {
            awaitable: defineProperties(element, props, config),
            addListener(changeListener: (changedKey?: string) => void) {
                element.changeListeners.push(changeListener);
            },
        };
    }

    export function joinProps<
        R extends PropTypeConfig,
        P extends PropTypeConfig,
        PP extends PropReturn<any, any>
    >(
        previousProps: PP & Props<any>,
        config: {
            reflect?: R;
            priv?: P;
        }
    ) {
        /* istanbul ignore next */
        if (!elementConfigs.has(previousProps)) {
            throw new Error('Previous props not defined');
        }
        const { element } = elementConfigs.get(previousProps)!;

        elementConfigs.set(previousProps, {
            composite: true,
            element,
        });

        return {
            awaitable: defineProperties(element, previousProps, config),
            addListener(
                changeListener: (value: any, changedKey?: string) => void
            ) {
                element.changeListeners.push(changeListener);
            },
        };
    }
}

/**
 * The type of a prop config object. This is the value
 * that is passed to the `reflect` and `priv` keys
 */
export type PropConfigObject = {
    [key: string]: DefinePropTypes | DefinePropTypeConfig;
};

/**
 * The return type given the two prop config objects (
 * the public one and the private one))
 */
export type PropReturn<
    PUB extends PropConfigObject,
    PRIV extends PropConfigObject
> = {
    [K in keyof PUB]: GetTSType<PUB[K]>;
} &
    {
        [K in keyof PRIV]: GetTSType<PRIV[K]>;
    };

/**
 * A map of element tag names to prop configs
 */
export const propConfigs: Map<
    string,
    {
        reflect?: PropConfigObject;
        priv?: PropConfigObject;
    }
> = new Map();

/**
 * A class used to define properties for components
 */
export class Props<
    C extends
        | {
              reflect?: any;
              priv?: any;
          }
        | undefined = any
> {
    // Keep this unused private value so typescript doesn't
    // optimise it away, breaking the config inference (InferPropConfig)
    // @ts-ignore
    constructor(public __config?: C) {}

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
     * @returns {Watchable<Props & R>} The properties for
     * 	this component
     */
    static define<
        PUB extends PropConfigObject,
        PRIV extends PropConfigObject,
        R extends PropReturn<PUB, PRIV>
    >(
        element: PropComponent,
        config?: {
            reflect: PUB;
            priv: PRIV;
        }
    ): Watchable<Props<typeof config> & ReturnType<PUB, PRIV>>;
    static define<
        PUB extends PropConfigObject,
        PRIV extends PropConfigObject,
        R extends PropReturn<PUB, PRIV>
    >(
        element: PropComponent,
        config?: {
            priv: PRIV;
        }
    ): Watchable<Props<typeof config> & ReturnType<{}, PRIV>>;
    static define<
        PUB extends PropConfigObject,
        PRIV extends PropConfigObject,
        R extends PropReturn<PUB, PRIV>
    >(
        element: PropComponent,
        config?: {
            reflect: PUB;
        }
    ): Watchable<Props<typeof config> & ReturnType<PUB, {}>>;
    static define<
        PUB extends PropConfigObject,
        PRIV extends PropConfigObject,
        R extends PropReturn<PUB, PRIV>
    >(element: PropComponent, config?: {}): Watchable<Props<typeof config>>;
    static define<
        PUB extends PropConfigObject,
        PRIV extends PropConfigObject,
        R extends PropReturn<PUB, PRIV>,
        PP extends PropReturn<any, any>
    >(
        element: PropComponent,
        config: {
            reflect: PUB;
            priv: PRIV;
        },
        parentProps: PP
    ): Watchable<Props<typeof config> & ReturnType<PUB, PRIV> & PP>;
    static define<
        PUB extends PropConfigObject,
        PRIV extends PropConfigObject,
        R extends PropReturn<PUB, PRIV>,
        PP extends PropReturn<any, any>
    >(
        element: PropComponent,
        config: {
            priv: PRIV;
        },
        parentProps: PP
    ): Watchable<Props<typeof config> & ReturnType<{}, PRIV> & PP>;
    static define<
        PUB extends PropConfigObject,
        PRIV extends PropConfigObject,
        R extends PropReturn<PUB, PRIV>,
        PP extends PropReturn<any, any>
    >(
        element: PropComponent,
        config: {
            reflect: PUB;
        },
        parentProps: PP
    ): Watchable<Props<typeof config> & ReturnType<PUB, {}> & PP>;
    static define<
        PUB extends PropConfigObject,
        PRIV extends PropConfigObject,
        R extends PropReturn<PUB, PRIV>,
        PP extends PropReturn<any, any>
    >(
        element: PropComponent,
        config: {},
        parentProps: PP
    ): Watchable<Props<typeof config> & PP>;
    static define<
        PUB extends PropConfigObject,
        PRIV extends PropConfigObject,
        R extends PropReturn<PUB, PRIV>,
        PP extends PropReturn<any, any>
    >(
        element: PropComponent,
        config: {
            reflect?: PUB;
            priv?: PRIV;
        } = {},
        parentProps: PP = (element as any).props
    ): Watchable<Props<typeof config> & R & PP> {
        const tag = element.tagName.toLowerCase();
        if (propConfigs.has(tag)) {
            propConfigs.set(tag, { ...propConfigs.get(tag)!, ...config });
        } else {
            propConfigs.set(tag, config);
        }

        // if parentProps = {}, that is the default value created in base.ts
        // ignore that as it's neither a Props object or something the user passed
        if (
            parentProps &&
            !(
                typeof parentProps === 'object' &&
                Object.keys(parentProps).length === 0 &&
                !(parentProps instanceof Props)
            )
        ) {
            if (
                typeof parentProps !== 'object' ||
                !(parentProps instanceof Props)
            ) {
                throw new Error('Parent props should be a Props object');
            }

            const { addListener } = PropsDefiner.joinProps(parentProps, config);
            return createWatchable(
                parentProps,
                (onChange) => {
                    addListener((changedKey) => {
                        onChange(parentProps, changedKey);
                    });
                },
                true
            ) as Watchable<Props<typeof config> & R & PP>;
        }

        const props = new Props(config);
        const { addListener } = PropsDefiner.define(
            props as Props<typeof config> & Partial<R>,
            element,
            config
        );
        return createWatchable(
            props,
            (onChange) => {
                addListener((changedKey) => {
                    onChange(props, changedKey);
                });
            },
            true
        ) as Watchable<Props<typeof config> & R & PP>;
    }

    /**
     * A function that will be called when the passed element
     * is connected to the dom (`connectedCallback` is called).
     * This is only used by the library and has no other uses.
     *
     * @param {HTMLElementAttributes} - The element that was connected
     */
    static onConnect(element: HTMLElementAttributes) {
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
    };
};
