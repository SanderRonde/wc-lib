import { Props, casingToDashes } from '../lib/props';
const DEFAULT_VERSION = 1.1;
export var HTMLCustomData;
(function (HTMLCustomData) {
    let Joining;
    (function (Joining) {
        function _joinValueSets(...valueSets) {
            const joinedValueSets = new Map();
            for (const valueSet of valueSets) {
                if (joinedValueSets.has(valueSet.name)) {
                    const storedValueSet = joinedValueSets.get(valueSet.name);
                    storedValueSet.values = _joinValues(...storedValueSet.values, ...valueSet.values);
                    joinedValueSets.set(valueSet.name, storedValueSet);
                }
                else {
                    joinedValueSets.set(valueSet.name, JSON.parse(JSON.stringify(valueSet)));
                }
            }
            return [...joinedValueSets.values()];
        }
        Joining._joinValueSets = _joinValueSets;
        function _joinValues(...values) {
            const joinedValues = new Map();
            for (const value of values) {
                if (joinedValues.has(value.name)) {
                    const storedValue = joinedValues.get(value.name);
                    storedValue.description =
                        storedValue.description || value.description;
                    storedValue.references = filterUniqueName([
                        ...(storedValue.references || []),
                        ...(value.references || []),
                    ]);
                    joinedValues.set(value.name, storedValue);
                }
                else {
                    joinedValues.set(value.name, JSON.parse(JSON.stringify(value)));
                }
            }
            return [...joinedValues.values()];
        }
        Joining._joinValues = _joinValues;
        function joinAttributes(...attributes) {
            const joinedAttributes = new Map();
            for (const attribute of attributes) {
                if (joinedAttributes.has(attribute.name)) {
                    const storedAttribute = joinedAttributes.get(attribute.name);
                    storedAttribute.description =
                        storedAttribute.description || attribute.description;
                    storedAttribute.valueSet =
                        storedAttribute.valueSet || attribute.valueSet;
                    storedAttribute.values = _joinValues(...(storedAttribute.values || []), ...(attribute.values || []));
                    joinedAttributes.set(attribute.name, storedAttribute);
                }
                else {
                    joinedAttributes.set(attribute.name, JSON.parse(JSON.stringify(attribute)));
                }
            }
            return [...joinedAttributes.values()];
        }
        Joining.joinAttributes = joinAttributes;
        function filterUniqueName(values) {
            const seenNames = new Set();
            const returnValues = [];
            for (const value of values) {
                if (!seenNames.has(value.name)) {
                    seenNames.add(value.name);
                    returnValues.push(value);
                }
            }
            return returnValues;
        }
        Joining.filterUniqueName = filterUniqueName;
        function joinTags(...tags) {
            const joinedTags = new Map();
            for (const tag of tags) {
                if (joinedTags.has(tag.name)) {
                    const storedTag = joinedTags.get(tag.name);
                    storedTag.description =
                        storedTag.description || tag.description;
                    storedTag.references = filterUniqueName([
                        ...(storedTag.references || []),
                        ...(tag.references || []),
                    ]);
                    storedTag.attributes = joinAttributes(...storedTag.attributes, ...tag.attributes);
                    joinedTags.get(tag.name).description;
                }
                else {
                    joinedTags.set(tag.name, JSON.parse(JSON.stringify(tag)));
                }
            }
            return [...joinedTags.values()];
        }
        Joining.joinTags = joinTags;
        function flatten(arr) {
            const elements = [];
            for (const element of arr) {
                if (Array.isArray(element)) {
                    elements.push(...flatten(element));
                }
                else {
                    elements.push(element);
                }
            }
            return elements;
        }
        Joining.flatten = flatten;
    })(Joining = HTMLCustomData.Joining || (HTMLCustomData.Joining = {}));
    let GenerateCustomData;
    (function (GenerateCustomData) {
        function _createInstance(tagName, baseClass) {
            return new (class Base extends baseClass {
                get isSSR() {
                    return true;
                }
                get tagName() {
                    return tagName;
                }
                constructor(...args) {
                    // @ts-ignore
                    super(...args);
                    Props.onConnect(this);
                }
            })();
        }
        GenerateCustomData._createInstance = _createInstance;
        function _getProps(baseClass) {
            const instance = _createInstance(baseClass.is, baseClass);
            if (!instance.props || !instance.props.__config) {
                return {};
            }
            return instance.props.__config;
        }
        GenerateCustomData._getProps = _getProps;
        function _collectDependencies(baseClass, dependencies = []) {
            dependencies.push(baseClass);
            /* istanbul ignore next */
            for (const dependency of baseClass.dependencies || []) {
                _collectDependencies(dependency, dependencies);
            }
            return dependencies;
        }
        GenerateCustomData._collectDependencies = _collectDependencies;
        function _propsToTags(props) {
            const attributes = [];
            const joinedProps = Object.assign(Object.assign({}, props.priv), props.reflect);
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
        GenerateCustomData._propsToTags = _propsToTags;
        function _generateComponentCustomData(component) {
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
        GenerateCustomData._generateComponentCustomData = _generateComponentCustomData;
        function generate(rootComponents, includeDependencies) {
            const rootComponentsArr = Array.isArray(rootComponents)
                ? rootComponents
                : [rootComponents];
            const components = includeDependencies
                ? Joining.flatten(rootComponentsArr.map((rootComponent) => {
                    return _collectDependencies(rootComponent);
                }))
                : rootComponentsArr;
            return joinCustomData(...components.map((component) => {
                return _generateComponentCustomData(component);
            }));
        }
        GenerateCustomData.generate = generate;
    })(GenerateCustomData = HTMLCustomData.GenerateCustomData || (HTMLCustomData.GenerateCustomData = {}));
})(HTMLCustomData || (HTMLCustomData = {}));
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
export function generateHTMLCustomData(rootComponents, includeDependencies = true) {
    return HTMLCustomData.GenerateCustomData.generate(rootComponents, includeDependencies);
}
/**
 * Join given HTMLCustomDatas together
 *
 * @param {HTMLCustomData[]} datas - The data objects
 *
 * @returns {HTMLCustomData} The joined custom data
 */
export function joinCustomData(...datas) {
    if (datas.length === 0)
        return {
            version: DEFAULT_VERSION,
            tags: [],
            globalAttributes: [],
            valueSets: [],
        };
    return {
        version: datas[0].version,
        tags: HTMLCustomData.Joining.joinTags(...HTMLCustomData.Joining.flatten(datas.map((data) => {
            return data.tags || [];
        }))),
        globalAttributes: HTMLCustomData.Joining.joinAttributes(...HTMLCustomData.Joining.flatten(datas.map((data) => {
            return data.globalAttributes || [];
        }))),
        valueSets: HTMLCustomData.Joining._joinValueSets(...HTMLCustomData.Joining.flatten(datas.map((data) => {
            return data.valueSets || [];
        }))),
    };
}
//# sourceMappingURL=html-custom-data.js.map