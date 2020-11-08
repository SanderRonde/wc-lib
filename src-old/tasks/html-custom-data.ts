import {
    WebComponentBaseTypeInstance,
    WebComponentBaseTypeStatic,
    WebComponentTypeInstance,
    WebComponentTypeStatic,
} from '../classes/types';
import { Props, PropConfigObject, casingToDashes } from '../lib/props';

const DEFAULT_VERSION = 1.1;

export interface BaseClassInstance
    extends WebComponentBaseTypeInstance,
        WebComponentTypeInstance {}

export type BaseClass = WebComponentBaseTypeStatic &
    WebComponentTypeStatic & {
        new (): BaseClassInstance;

        dependencies?:
            | {
                  define(isDevelopment?: boolean, isRoot?: boolean): void;
              }[]
            | null;
        description?: string;
        is?: string | null;
    };

export interface HTMLCustomData {
    version: typeof DEFAULT_VERSION;
    tags?: HTMLCustomData.Types.CustomDataTag[];
    globalAttributes?: HTMLCustomData.Types.Attribute[];
    valueSets?: HTMLCustomData.Types._ValueSet[];
}

export namespace HTMLCustomData {
    export namespace Types {
        export interface _MarkupDescription {
            kind: 'plaintext' | 'markdown';
            value: string;
        }

        export interface _ValueSet {
            name: string;
            values: HTMLCustomData.Types.AttributeValue[];
        }

        export interface _References {
            name: string;
            url: string;
        }

        export interface AttributeValue {
            name: string;
            description?: string | _MarkupDescription;
            references?: _References[];
        }

        export interface Attribute {
            name: string;
            description?: string | _MarkupDescription;
            valueSet?: string;
            values?: AttributeValue[];
        }

        export interface CustomDataTag {
            name: string;
            description?: string | _MarkupDescription;
            attributes: Attribute[];
            references?: _References[];
        }
    }

    export namespace Joining {
        export function _joinValueSets(...valueSets: Types._ValueSet[]) {
            const joinedValueSets: Map<string, Types._ValueSet> = new Map();
            for (const valueSet of valueSets) {
                if (joinedValueSets.has(valueSet.name)) {
                    const storedValueSet = joinedValueSets.get(valueSet.name)!;
                    storedValueSet.values = _joinValues(
                        ...storedValueSet.values,
                        ...valueSet.values
                    );
                    joinedValueSets.set(valueSet.name, storedValueSet);
                } else {
                    joinedValueSets.set(
                        valueSet.name,
                        JSON.parse(JSON.stringify(valueSet))
                    );
                }
            }
            return [...joinedValueSets.values()];
        }

        export function _joinValues(...values: Types.AttributeValue[]) {
            const joinedValues: Map<string, Types.AttributeValue> = new Map();
            for (const value of values) {
                if (joinedValues.has(value.name)) {
                    const storedValue = joinedValues.get(value.name)!;
                    storedValue.description =
                        storedValue.description || value.description;
                    storedValue.references = filterUniqueName([
                        ...(storedValue.references || []),
                        ...(value.references || []),
                    ]);
                    joinedValues.set(value.name, storedValue);
                } else {
                    joinedValues.set(
                        value.name,
                        JSON.parse(JSON.stringify(value))
                    );
                }
            }
            return [...joinedValues.values()];
        }

        export function joinAttributes(
            ...attributes: Types.Attribute[]
        ): Types.Attribute[] {
            const joinedAttributes: Map<string, Types.Attribute> = new Map();
            for (const attribute of attributes) {
                if (joinedAttributes.has(attribute.name)) {
                    const storedAttribute = joinedAttributes.get(
                        attribute.name
                    )!;
                    storedAttribute.description =
                        storedAttribute.description || attribute.description;
                    storedAttribute.valueSet =
                        storedAttribute.valueSet || attribute.valueSet;
                    storedAttribute.values = _joinValues(
                        ...(storedAttribute.values || []),
                        ...(attribute.values || [])
                    );
                    joinedAttributes.set(attribute.name, storedAttribute);
                } else {
                    joinedAttributes.set(
                        attribute.name,
                        JSON.parse(JSON.stringify(attribute))
                    );
                }
            }
            return [...joinedAttributes.values()];
        }

        export function filterUniqueName<
            V extends {
                name: string;
            }
        >(values: V[]): V[] {
            const seenNames: Set<string> = new Set();
            const returnValues: V[] = [];
            for (const value of values) {
                if (!seenNames.has(value.name)) {
                    seenNames.add(value.name);
                    returnValues.push(value);
                }
            }
            return returnValues;
        }

        export function joinTags(...tags: Types.CustomDataTag[]) {
            const joinedTags: Map<string, Types.CustomDataTag> = new Map();
            for (const tag of tags) {
                if (joinedTags.has(tag.name)) {
                    const storedTag = joinedTags.get(tag.name)!;
                    storedTag.description =
                        storedTag.description || tag.description;
                    storedTag.references = filterUniqueName([
                        ...(storedTag.references || []),
                        ...(tag.references || []),
                    ]);
                    storedTag.attributes = joinAttributes(
                        ...storedTag.attributes,
                        ...tag.attributes
                    );
                    joinedTags.get(tag.name)!.description;
                } else {
                    joinedTags.set(tag.name, JSON.parse(JSON.stringify(tag)));
                }
            }
            return [...joinedTags.values()];
        }

        export function flatten<V>(arr: V[][]): V[] {
            const elements = [];
            for (const element of arr) {
                if (Array.isArray(element)) {
                    elements.push(...flatten(element as any));
                } else {
                    elements.push(element);
                }
            }
            return elements as V[];
        }
    }

    export namespace GenerateCustomData {
        export function _createInstance(
            tagName: string | null | undefined,
            baseClass: BaseClass
        ) {
            return new (class Base extends baseClass {
                get isSSR() {
                    return true;
                }

                get tagName() {
                    return tagName;
                }

                constructor(...args: any[]) {
                    // @ts-ignore
                    super(...args);

                    Props.onConnect(this as any);
                }
            })();
        }

        export function _getProps(
            baseClass: BaseClass
        ): {
            reflect?: PropConfigObject;
            priv?: PropConfigObject;
        } {
            const instance = _createInstance(baseClass.is, baseClass);
            if (!instance.props || !(instance.props as Props).__config) {
                return {};
            }
            return (instance.props as Props).__config;
        }

        export function _collectDependencies(
            baseClass: BaseClass,
            dependencies: BaseClass[] = []
        ) {
            dependencies.push(baseClass);
            /* istanbul ignore next */
            for (const dependency of baseClass.dependencies || []) {
                _collectDependencies(
                    (dependency as unknown) as BaseClass,
                    dependencies
                );
            }
            return dependencies;
        }

        export function _propsToTags(props: {
            reflect?: PropConfigObject;
            priv?: PropConfigObject;
        }): Types.Attribute[] {
            const attributes: Types.Attribute[] = [];
            const joinedProps = { ...props.priv, ...props.reflect };
            for (const key in joinedProps) {
                const description = (() => {
                    const value = joinedProps[key];
                    if (typeof value === 'object' && 'type' in value) {
                        return value.description;
                    }
                    return undefined;
                })();
                attributes.push({
                    name: casingToDashes(key),
                    description: description,
                });
            }
            return attributes;
        }

        export function _generateComponentCustomData(
            component: BaseClass
        ): HTMLCustomData {
            /* istanbul ignore next */
            if (!component.is)
                return {
                    version: 1.1,
                };
            return {
                version: DEFAULT_VERSION,
                tags: [
                    {
                        name: component.is,
                        description: component.description,
                        attributes: _propsToTags(_getProps(component)),
                    },
                ],
            };
        }

        export function generate(
            rootComponents: BaseClass[] | BaseClass,
            includeDependencies: boolean
        ): HTMLCustomData {
            const rootComponentsArr = Array.isArray(rootComponents)
                ? rootComponents
                : [rootComponents];
            const components = includeDependencies
                ? Joining.flatten(
                      rootComponentsArr.map((rootComponent) => {
                          return _collectDependencies(rootComponent);
                      })
                  )
                : rootComponentsArr;
            return joinCustomData(
                ...components.map((component) => {
                    return _generateComponentCustomData(component);
                })
            );
        }
    }
}

/**
 * Generate HTML custom data for given root components. The resulting
 * 	file can be used to inform VSCode of the new tags and their
 * 	attributes. Check out
 * 	https://github.com/Microsoft/vscode-html-languageservice/blob/master/docs/customData.md
 * 	for more info
 *
 * @param {BaseClass[]|BaseClass} rootComponents - The root components
 * 	that should be included in the tagmap
 * @param {boolean} [includeDependencies] - Whether to recursively
 * 	follow the dependency tree of the components, generating
 * 	a tagmap of their dependencies as well
 *
 * @returns {HTMLCustomData} A tagmap file's text content. Convert
 * 	to JSON and write to file to use it as a tagmap in VSCode
 */
export function generateHTMLCustomData(
    rootComponents: BaseClass | BaseClass[],
    includeDependencies: boolean = true
): HTMLCustomData {
    return HTMLCustomData.GenerateCustomData.generate(
        rootComponents,
        includeDependencies
    );
}

/**
 * Join given HTMLCustomDatas together
 *
 * @param {HTMLCustomData[]} datas - The data objects
 *
 * @returns {HTMLCustomData} The joined custom data
 */
export function joinCustomData(...datas: HTMLCustomData[]): HTMLCustomData {
    if (datas.length === 0)
        return {
            version: DEFAULT_VERSION,
            tags: [],
            globalAttributes: [],
            valueSets: [],
        };

    return {
        version: datas[0].version,
        tags: HTMLCustomData.Joining.joinTags(
            ...HTMLCustomData.Joining.flatten(
                datas.map((data) => {
                    return data.tags || [];
                })
            )
        ),
        globalAttributes: HTMLCustomData.Joining.joinAttributes(
            ...HTMLCustomData.Joining.flatten(
                datas.map((data) => {
                    return data.globalAttributes || [];
                })
            )
        ),
        valueSets: HTMLCustomData.Joining._joinValueSets(
            ...HTMLCustomData.Joining.flatten(
                datas.map((data) => {
                    return data.valueSets || [];
                })
            )
        ),
    };
}
