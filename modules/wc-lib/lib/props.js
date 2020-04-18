var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * The prefix used for complex references
 *
 * @constant
 */
export const refPrefix = '___complex_ref';
function getterWithVal(component, value, strict, type) {
    if (type === 'bool') {
        if (strict) {
            return value + '' === 'true';
        }
        return value !== undefined && value !== null && value !== 'false';
    }
    else {
        /* istanbul ignore else */
        if (value !== undefined && value !== null && value !== 'false') {
            if (type === 'number') {
                return ~~value;
            }
            else if (type === complex) {
                if (value.startsWith(refPrefix)) {
                    /* istanbul ignore else */
                    if (component.getParentRef) {
                        return component.getParentRef(value);
                    }
                    /* istanbul ignore next */
                    return value;
                }
                else {
                    try {
                        return JSON.parse(decodeURIComponent(value));
                    }
                    catch (e) {
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
export function getter(element, name, strict, type) {
    return getterWithVal(element, element.getAttribute(name), strict, type);
}
export function setter(setAttrFn, removeAttrFn, name, value, type) {
    if (type === 'bool') {
        const boolVal = value;
        if (boolVal) {
            setAttrFn(name, '');
        }
        else {
            removeAttrFn(name);
        }
    }
    else {
        const strVal = value;
        if (type === complex) {
            try {
                setAttrFn(name, encodeURIComponent(JSON.stringify(strVal)));
            }
            catch (e) {
                // istanbul ignore next
                setAttrFn(name, encodeURIComponent('_'));
            }
        }
        else {
            setAttrFn(name, String(strVal));
        }
    }
}
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
export function ComplexType() {
    return complex;
}
function getDefinePropConfig(value) {
    if (typeof value === 'object' && 'type' in value) {
        const data = value;
        return data;
    }
    else {
        return {
            coerce: false,
            watch: true,
            strict: false,
            reflectToSelf: true,
            type: value,
        };
    }
}
var Watching;
(function (Watching) {
    function genProxyStructureLevel(pathParts) {
        const currentLevel = new Map();
        for (const path of pathParts) {
            if (!currentLevel.has(path[0])) {
                currentLevel.set(path[0], {
                    name: path[0],
                    relevantPaths: [],
                    watchCurrent: path.length === 1,
                    map: new Map(),
                });
            }
            currentLevel.get(path[0]).relevantPaths.push(...pathParts);
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
                    if (otherLevel.map === level.map)
                        continue;
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
            level.map = genProxyStructureLevel(level.relevantPaths
                .map((p) => p.slice(1))
                .filter((p) => p.length));
        }
        return currentLevel;
    }
    function getProxyStructure(paths) {
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
    function createDeepProxy(obj, onAccessed) {
        const isArr = Array.isArray(obj);
        const proxy = new Proxy(obj, {
            set(_obj, prop, value) {
                const isPropChange = (() => {
                    if (isArr) {
                        if (typeof prop === 'symbol')
                            return true;
                        if (typeof prop === 'number' ||
                            !Number.isNaN(parseInt(prop))) {
                            return true;
                        }
                        return false;
                    }
                    else {
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
                }
                else {
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
            if (typeof obj[key] === 'object') {
                obj[key] = createDeepProxy(obj[key], onAccessed);
            }
        }
        return proxy;
    }
    function watchObjectLevel(obj, level, onAccessed) {
        if (!obj)
            return obj;
        const isArr = Array.isArray(obj);
        const proxy = new Proxy(obj, {
            set(_obj, prop, value) {
                const isPropChange = (() => {
                    if (isArr) {
                        if (level.has('*')) {
                            if (typeof prop === 'symbol')
                                return true;
                            return (typeof prop === 'number' ||
                                !Number.isNaN(parseInt(prop)));
                        }
                        if (typeof prop !== 'symbol' &&
                            level.has(prop + '') &&
                            level.get(prop + '').watchCurrent) {
                            return true;
                        }
                        return false;
                    }
                    else {
                        if (typeof prop !== 'symbol') {
                            return ((level.get(prop + '') &&
                                level.get(prop + '').watchCurrent) ||
                                (level.get('*') && level.get('*').watchCurrent));
                        }
                        return level.has('*') && level.get('*').watchCurrent;
                    }
                })();
                if (isPropChange) {
                    const nextLevel = (typeof prop !== 'symbol' && level.get(prop + '')) ||
                        level.get('*');
                    if (nextLevel.map.size && typeof value === 'object') {
                        // Watch this as well
                        value = watchObjectLevel(value, nextLevel.map, onAccessed);
                    }
                    const accessProp = (() => {
                        if (isArr) {
                            if (typeof prop === 'symbol')
                                return prop;
                            return parseInt(prop + '');
                        }
                        else {
                            return prop;
                        }
                    })();
                    const oldValue = obj[accessProp];
                    obj[accessProp] = value;
                    if (oldValue !== value) {
                        onAccessed();
                    }
                }
                else {
                    obj[prop] = value;
                }
                return true;
            },
            deleteProperty(_obj, prop) {
                if (Reflect.has(obj, prop)) {
                    const deleted = Reflect.deleteProperty(obj, prop);
                    // istanbul ignore next
                    if (deleted &&
                        ((typeof prop !== 'symbol' && level.has(prop + '')) ||
                            level.has('*'))) {
                        onAccessed();
                    }
                    return deleted;
                }
                return true;
            },
        });
        for (const name of Object.keys(obj)) {
            if ((level.has(name) || level.has('*')) &&
                typeof obj[name] === 'object') {
                obj[name] = watchObjectLevel(obj[name], (level.get(name) || level.get('*')).map, onAccessed);
            }
        }
        return proxy;
    }
    function watchObject(obj, properties, callback) {
        if (typeof obj !== 'object' ||
            obj === undefined ||
            obj === null ||
            (typeof HTMLElement !== 'undefined' && obj instanceof HTMLElement)) {
            return obj;
        }
        if (typeof Proxy === 'undefined') {
            console.warn('Attempted to watch object while proxy method is not supported');
            return obj;
        }
        if (properties.has('**')) {
            return createDeepProxy(obj, callback);
        }
        else {
            return watchObjectLevel(obj, properties, callback);
        }
    }
    function watchValue(render, value, watch, watchProperties) {
        if (typeof value === 'object' &&
            (watch || watchProperties.length > 0)) {
            value = watchObject(value, watchProperties.length
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
                ]), () => {
                render(1 /* PROP */);
            });
        }
        return value;
    }
    Watching.watchValue = watchValue;
})(Watching || (Watching = {}));
const cachedCasing = new Map();
function dashesToCasing(name) {
    const cached = cachedCasing.get(name);
    if (cached) {
        return cached;
    }
    if (name.indexOf('-') === -1)
        return name;
    let newStr = '';
    for (let i = 0; i < name.length; i++) {
        if (name[i] === '-') {
            newStr += name[i + 1].toUpperCase();
            i++;
        }
        else {
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
export function casingToDashes(name) {
    if (!/[A-Z]/.test(name))
        return name;
    let newStr = '';
    for (const char of name) {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            newStr += '-' + char.toLowerCase();
        }
        else {
            newStr += char;
        }
    }
    return newStr;
}
function getCoerced(initial, mapType) {
    switch (mapType) {
        case "string" /* STRING */:
            return initial || '';
        case "bool" /* BOOL */:
            return initial || false;
        case "number" /* NUMBER */:
            return initial || 0;
    }
    return initial;
}
const connectMap = new WeakMap();
const connectedElements = new WeakSet();
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
export function awaitConnected(el) {
    return __awaiter(this, void 0, void 0, function* () {
        /* istanbul ignore next */
        if (connectedElements.has(el))
            return;
        yield new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const arr = connectMap.get(el) || [];
            arr.push(resolve);
            connectMap.set(el, arr);
        }));
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
export function hookIntoConnect(el, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        // istanbul ignore next
        if (connectedElements.has(el)) {
            fn();
            return;
        }
        yield new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            /* istanbul ignore next */
            const arr = connectMap.get(el) || [];
            arr.push(() => {
                fn();
                resolve();
            });
            connectMap.set(el, arr);
        }));
    });
}
var PropsDefiner;
(function (PropsDefiner) {
    const renderMap = new WeakMap();
    function queueRender(element, changeType) {
        if (!renderMap.has(element)) {
            renderMap.set(element, changeType);
        }
        setTimeout(() => {
            element.renderToDOM(renderMap.get(element));
            renderMap.delete(element);
        }, 0);
    }
    function createQueueRenderFn(element) {
        return (changeType) => {
            queueRender(element, changeType);
        };
    }
    class ElementRepresentation {
        constructor(component) {
            this.component = component;
            this.keyMap = new Map();
            this.propValues = {};
            this.preMountedQueue = {
                set: [],
                remove: [],
            };
            this.setAttr = component.setAttribute.bind(component);
            this.removeAttr = component.removeAttribute.bind(component);
        }
        overrideAttributeFunctions() {
            this.component.setAttribute = (key, val) => {
                if (!this.component.isMounted) {
                    this.preMountedQueue.set.push([key, val]);
                    this.setAttr(key, val);
                    return;
                }
                onSetAttribute(key, val, this);
            };
            this.component.removeAttribute = (key) => {
                if (!this.component.isMounted) {
                    this.preMountedQueue.remove.push(key);
                    this.removeAttr(key);
                    return;
                }
                onRemoveAttribute(key, this);
            };
        }
        runQueued() {
            this.preMountedQueue.set.forEach(([key, val]) => onSetAttribute(key, val, this));
            this.preMountedQueue.remove.forEach((key) => onRemoveAttribute(key, this));
            if (!this.component.isSSR) {
                queueRender(this.component, 1 /* PROP */);
            }
        }
    }
    function getKeys({ reflect = {}, priv = {}, }) {
        return [
            ...Object.getOwnPropertyNames(reflect).map((key) => {
                return {
                    key: key,
                    value: reflect[key],
                    reflectToAttr: true,
                };
            }),
            ...Object.getOwnPropertyNames(priv).map((key) => {
                return {
                    key: key,
                    value: priv[key],
                    reflectToAttr: false,
                };
            }),
        ];
    }
    function onSetAttribute(key, val, el) {
        const casingKey = dashesToCasing(key);
        if (el.keyMap.has(casingKey)) {
            const { watch, mapType, strict } = el.keyMap.get(casingKey);
            const prevVal = el.propValues[casingKey];
            const newVal = getterWithVal(el.component, val, strict, mapType);
            if (prevVal === newVal)
                return;
            el.component.fire('beforePropChange', casingKey, newVal, prevVal);
            el.propValues[casingKey] = newVal;
            el.component.fire('propChange', casingKey, newVal, prevVal);
            if (watch) {
                queueRender(el.component, 1 /* PROP */);
            }
        }
        else {
            el.propValues[casingKey] = val;
        }
        el.setAttr(key, val);
    }
    function onRemoveAttribute(key, el) {
        const casingKey = dashesToCasing(key);
        if (el.keyMap.has(casingKey)) {
            const { watch, coerce, mapType } = el.keyMap.get(casingKey);
            const prevVal = el.propValues[casingKey];
            const newVal = (() => {
                if (coerce) {
                    return getCoerced(undefined, mapType);
                }
                if (mapType === "bool" /* BOOL */) {
                    return false;
                }
                return undefined;
            })();
            if (prevVal !== newVal) {
                el.component.fire('beforePropChange', casingKey, newVal, prevVal);
                el.propValues[casingKey] = newVal;
                el.component.fire('propChange', casingKey, newVal, prevVal);
                if (watch) {
                    queueRender(el.component, 1 /* PROP */);
                }
            }
        }
        el.removeAttr(key);
    }
    const elementConfigs = new WeakMap();
    class Property {
        constructor(_propertyConfig, _rep, _props) {
            this._propertyConfig = _propertyConfig;
            this._rep = _rep;
            this._props = _props;
            this.__config = null;
        }
        __getConfig() {
            const { key, value, reflectToAttr } = this._propertyConfig;
            const mapKey = key;
            const propName = casingToDashes(mapKey);
            const { watch = true, coerce = false, defaultValue, value: defaultValue2, type: type, strict = false, watchProperties = [], reflectToSelf = true, description, } = getDefinePropConfig(value);
            return {
                watch,
                coerce,
                type,
                strict,
                watchProperties,
                reflectToSelf,
                mapKey: mapKey,
                key,
                reflectToAttr,
                propName,
                defaultValue: defaultValue !== undefined ? defaultValue : defaultValue2,
                description: description || '',
            };
        }
        get config() {
            if (this.__config) {
                return this.__config;
            }
            return (this.__config = this.__getConfig());
        }
        setKeyMap(keyMap) {
            const { key } = this._propertyConfig;
            const { watch, coerce, type: mapType, strict, reflectToAttr, } = this.config;
            keyMap.set(key, {
                watch,
                coerce,
                mapType,
                strict,
                reflectToAttr,
            });
        }
        _setReflect() {
            const _this = this;
            const { mapKey } = this.config;
            if (mapKey in this._rep.component)
                return;
            Object.defineProperty(this._rep.component, mapKey, {
                get() {
                    return _this._rep.propValues[mapKey];
                },
                set(value) {
                    const props = _this._props;
                    if (props[mapKey] === value)
                        return;
                    props[mapKey] = value;
                },
            });
        }
        setReflect() {
            const { reflectToSelf } = this.config;
            if (reflectToSelf) {
                this._setReflect();
            }
        }
        setPropAccessors() {
            const _this = this;
            const { mapKey, coerce, type, key, watch, watchProperties, propName, } = this.config;
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
                    value = Watching.watchValue(createQueueRenderFn(_this._rep.component), value, watch, watchProperties);
                    if (_this._props[mapKey] === value)
                        return;
                    const prevVal = _this._rep.propValues[mapKey];
                    _this._rep.component.fire('beforePropChange', key, value, prevVal);
                    _this._rep.propValues[mapKey] = value;
                    _this._rep.component.fire('propChange', key, value, prevVal);
                    if (_this._propertyConfig.reflectToAttr) {
                        setter(_this._rep.setAttr, _this._rep.removeAttr, propName, original, type);
                    }
                    if (watch) {
                        queueRender(_this._rep.component, 1 /* PROP */);
                    }
                },
            });
        }
        assignComplexType() {
            return __awaiter(this, void 0, void 0, function* () {
                const { type, mapKey, propName, strict, watch, watchProperties, } = this.config;
                yield hookIntoConnect(this._rep.component, () => {
                    this._rep.propValues[mapKey] = Watching.watchValue(createQueueRenderFn(this._rep.component), this._rep.component.hasAttribute(propName)
                        ? getter(this._rep.component, propName, strict, type)
                        : undefined, watch, watchProperties);
                });
            });
        }
        assignSimpleType() {
            const { type, mapKey, propName, strict, watch, watchProperties, } = this.config;
            this._rep.propValues[mapKey] = Watching.watchValue(createQueueRenderFn(this._rep.component), this._rep.component.hasAttribute(propName) ||
                (strict && type === 'bool')
                ? getter(this._rep.component, propName, strict, type)
                : undefined, watch, watchProperties);
        }
        doDefaultAssign() {
            return __awaiter(this, void 0, void 0, function* () {
                const { defaultValue, mapKey, watch, watchProperties, propName, type, reflectToAttr, } = this.config;
                if (defaultValue !== undefined) {
                    yield hookIntoConnect(this._rep.component, () => {
                        if (this._rep.propValues[mapKey] === undefined) {
                            this._rep.propValues[mapKey] = Watching.watchValue(createQueueRenderFn(this._rep.component), defaultValue, watch, watchProperties);
                        }
                        if (reflectToAttr) {
                            setter(this._rep.setAttr, this._rep.removeAttr, propName, this._rep.propValues[mapKey], type);
                        }
                    });
                }
                else if (type === complex && reflectToAttr) {
                    yield hookIntoConnect(this._rep.component, () => {
                        setter(this._rep.setAttr, this._rep.removeAttr, propName, this._rep.propValues[mapKey], type);
                    });
                }
            });
        }
    }
    function defineProperties(element, props, config) {
        const keys = getKeys(config);
        const properties = keys.map((key) => new Property(key, element, props));
        properties.forEach((property) => property.setKeyMap(element.keyMap));
        properties.forEach((property) => property.setReflect());
        properties.forEach((property) => property.setPropAccessors());
        return Promise.all(properties.map((property) => {
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
                property.doDefaultAssign(),
            ]);
        }));
    }
    function define(props, component, config) {
        const element = new ElementRepresentation(component);
        element.overrideAttributeFunctions();
        if (component.isSSR) {
            element.runQueued();
            connectedElements.add(component);
        }
        else {
            awaitConnected(component).then(() => {
                element.runQueued();
            });
        }
        elementConfigs.set(props, {
            composite: false,
            element,
        });
        return defineProperties(element, props, config);
    }
    PropsDefiner.define = define;
    function joinProps(previousProps, config) {
        return __awaiter(this, void 0, void 0, function* () {
            /* istanbul ignore next */
            if (!elementConfigs.has(previousProps)) {
                throw new Error('Previous props not defined');
            }
            const { element } = elementConfigs.get(previousProps);
            elementConfigs.set(previousProps, {
                composite: true,
                element,
            });
            yield defineProperties(element, previousProps, config);
        });
    }
    PropsDefiner.joinProps = joinProps;
})(PropsDefiner || (PropsDefiner = {}));
/**
 * A map of element tag names to prop configs
 */
export const propConfigs = new Map();
/**
 * A class used to define properties for components
 */
export class Props {
    // Keep this unused private value so typescript doesn't
    // optimise it away, breaking the config inference (InferPropConfig)
    // @ts-ignore
    constructor(__config) {
        this.__config = __config;
    }
    static define(element, config = {}, parentProps = element.props) {
        const tag = element.tagName.toLowerCase();
        if (propConfigs.has(tag)) {
            propConfigs.set(tag, Object.assign(Object.assign({}, propConfigs.get(tag)), config));
        }
        else {
            propConfigs.set(tag, config);
        }
        // if parentProps = {}, that is the default value created in base.ts
        // ignore that as it's neither a Props object or something the user passed
        if (parentProps &&
            !(typeof parentProps === 'object' &&
                Object.keys(parentProps).length === 0 &&
                !(parentProps instanceof Props))) {
            if (typeof parentProps !== 'object' ||
                !(parentProps instanceof Props)) {
                throw new Error('Parent props should be a Props object');
            }
            PropsDefiner.joinProps(parentProps, config);
            return parentProps;
        }
        const props = new Props(config);
        PropsDefiner.define(props, element, config);
        return props;
    }
    /**
     * A function that will be called when the passed element
     * is connected to the dom (`connectedCallback` is called).
     * This is only used by the library and has no other uses.
     *
     * @param {HTMLElementAttributes} - The element that was connected
     */
    static onConnect(element) {
        if (connectMap.has(element)) {
            for (const listener of connectMap.get(element)) {
                listener();
            }
        }
        connectedElements.add(element);
    }
}
//# sourceMappingURL=props.js.map