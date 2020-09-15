var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { parse as parseCSS, stringify as stringifyCSS, } from 'css';
import { Parser as HTMLParser, DomHandler } from 'htmlparser2';
import { StyleAttributePart } from '../template-manager';
import { classNames } from '../shared';
import { Props } from '../props';
/**
 * The serverside rendering namespace that is used internally to do the whole
 * operation. The entire thing and its contents are exported but only the
 * "useful" exports are not prefixed with an underscore. This means you can
 * always access anything but can still distinguish between code that
 * should or should not be imported.
 */
export var SSR;
(function (SSR) {
    let Errors;
    (function (Errors) {
        class RenderError extends Error {
            constructor(message, source) {
                super(message);
                this.source = source;
                this.name = 'RenderError';
                this.message = `Error while rendering component on the server: ${source.name}, ${source.message}`;
                this.stack = source.stack;
            }
        }
        Errors.RenderError = RenderError;
        class CSSParseError extends Error {
            constructor(message, source, file) {
                super(message);
                this.source = source;
                this.file = file;
                this.name = 'CSSParseError';
                this.message = `Error while parsing rendered CSS: ${source.name}, ${source.message}\n${source.stack}\nIn CSS file: ${file}`;
                this.stack = source.stack;
            }
        }
        Errors.CSSParseError = CSSParseError;
        function _renderError(e) {
            throw new RenderError(e.message, e);
        }
        Errors._renderError = _renderError;
        function _cssParseError(e, file) {
            throw new CSSParseError(e.message, e, file);
        }
        Errors._cssParseError = _cssParseError;
    })(Errors = SSR.Errors || (SSR.Errors = {}));
    class MergableWeakMap {
        constructor() {
            this._maps = [new WeakMap()];
            this[Symbol.toStringTag] = this._maps[0][Symbol.toStringTag];
        }
        merge(map) {
            this._maps.push(...map._maps);
            return this;
        }
        delete(key) {
            let deleted = false;
            for (const map of this._maps) {
                if (map.delete(key)) {
                    deleted = true;
                }
            }
            return deleted;
        }
        get(key) {
            for (const map of this._maps) {
                if (map.has(key)) {
                    return map.get(key);
                }
            }
            return undefined;
        }
        has(key) {
            for (const map of this._maps) {
                if (map.has(key))
                    return true;
            }
            return false;
        }
        set(key, value) {
            this._maps[0].set(key, value);
            return this;
        }
        clone() {
            const newMap = new MergableWeakMap();
            // Setting is performed on the first map so this should
            // create a readonly clone
            newMap._maps.push(...this._maps);
            return newMap;
        }
    }
    SSR.MergableWeakMap = MergableWeakMap;
    class MergableWeakSet {
        constructor() {
            this._sets = [new WeakSet()];
            this[Symbol.toStringTag] = this._sets[0][Symbol.toStringTag];
        }
        merge(set) {
            this._sets.push(...set._sets);
            return this;
        }
        delete(value) {
            let deleted = false;
            for (const set of this._sets) {
                if (set.delete(value)) {
                    deleted = true;
                }
            }
            return deleted;
        }
        has(value) {
            for (const set of this._sets) {
                if (set.has(value))
                    return true;
            }
            return false;
        }
        add(value) {
            this._sets[0].add(value);
            return this;
        }
        clone() {
            const newSet = new MergableWeakSet();
            // Setting is performed on the first set so this should
            // create a readonly clone
            newSet._sets.push(...this._sets);
            return newSet;
        }
    }
    SSR.MergableWeakSet = MergableWeakSet;
    class DocumentSession {
        constructor({ i18n, theme, getMessage, lang, themeName, doWait, } = {}) {
            this._cssIdentifierMap = new MergableWeakMap();
            this._sheetSet = new MergableWeakSet();
            // This is an object so that references to it are updated
            this._unnamedElements = {
                amount: 0,
            };
            this._elementMap = {};
            this._i18n = i18n;
            this._lang = lang;
            this._theme = theme;
            this._doWait = doWait;
            this._themeName = themeName;
            this._getMessage = getMessage;
        }
        /**
         * Merge a config into this SSR session, prioritizing config over current state
         */
        mergeConfig({ i18n, theme, getMessage, lang, themeName, doWait, }) {
            this._i18n = i18n || this._i18n;
            this._lang = lang || this._lang;
            this._theme = theme || this._theme;
            this._doWait = doWait || this._doWait;
            this._themeName = themeName || this._themeName;
            this._getMessage = getMessage || this._getMessage;
            return this;
        }
        /**
         * Merge a document session into this one, prioritizing the merged one
         *
         * @param {DocumentSession} session - The session to merge
         *
         * @returns {DocumentSession} The merged documentSession (this)
         */
        merge(session) {
            return DocumentSession.merge(this, session);
        }
        /**
         * Clone this document session and preserve any object links.
         * Any changes to the clone **are** reflected to the original.
         *
         * @returns {DocumentSession} The clone
         */
        clone() {
            const session = new DocumentSession({
                i18n: this._i18n,
                theme: this._theme,
                getMessage: this._getMessage,
            });
            session._cssIdentifierMap = this._cssIdentifierMap;
            session._sheetSet = this._sheetSet;
            session._unnamedElements = this._unnamedElements;
            session._elementMap = this._elementMap;
            return session;
        }
        /**
         * Merge given sessions into the first one, prioritizing later values
         * over the earlier ones.
         *
         * @param {DocumentSession} target - The target into which everything is merged
         * @param {DocumentSession[]} [sessions] - Sessions to merge into this one
         *
         * @returns {DocumentSession} The merged into documentSession (this)
         */
        static merge(target, ...sessions) {
            for (const session of sessions) {
                target._i18n = session._i18n || target._i18n;
                target._theme = session._theme || target._theme;
                target._getMessage = session._getMessage || target._getMessage;
                target._cssIdentifierMap = session._cssIdentifierMap.merge(session._cssIdentifierMap);
                target._sheetSet = session._sheetSet.merge(session._sheetSet);
                target._unnamedElements = {
                    amount: Math.max(session._unnamedElements.amount, session._unnamedElements.amount),
                };
                target._elementMap = Object.assign(Object.assign({}, session._elementMap), target._elementMap);
            }
            return target;
        }
    }
    SSR.DocumentSession = DocumentSession;
    let BaseTypes;
    (function (BaseTypes) {
        function _createBase(klass, tagName, props, attributes, session) {
            const joinedAttributes = Object.assign(Object.assign({}, attributes), props);
            const refMap = new Map();
            return class Base extends klass {
                get isSSR() {
                    return true;
                }
                get tagName() {
                    return tagName;
                }
                constructor(...args) {
                    super(...args);
                    Props.onConnect(this);
                }
                getParentRef(ref) {
                    // There is no real parent here so refer back to the ref-hoster
                    // which is itself
                    return this.getRef(ref);
                }
                getAttribute(name) {
                    const value = joinedAttributes[name];
                    if (_Attributes._isPrimitive(value)) {
                        return String(value);
                    }
                    // Generate ref instead
                    /* istanbul ignore next */
                    if (refMap.has(name)) {
                        return refMap.get(name);
                    }
                    const ref = 'genRef' in this && this.genRef
                        ? this.genRef(value)
                        : /* istanbul ignore next */
                            String(value);
                    refMap.set(name, ref);
                    return ref;
                }
                hasAttribute(name) {
                    return joinedAttributes.hasOwnProperty(name);
                }
                setAttribute(name, value) {
                    joinedAttributes[name] = value;
                }
                removeAttribute(name) {
                    delete joinedAttributes[name];
                }
                getTheme() {
                    return session._theme;
                }
                getThemeName() {
                    return session._themeName;
                }
                getRenderArgs(changeType) {
                    return {
                        props: this.props,
                        theme: this.getTheme(),
                        changeType: changeType,
                    };
                }
                getLang() {
                    return session._lang;
                }
                static _getI18n(key, ...values) {
                    if (!session._i18n)
                        return undefined;
                    if (session._getMessage) {
                        return session._getMessage(session._i18n, key, values);
                    }
                    return session._i18n[key];
                }
                __prom(key, ...values) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return Base._getI18n(key, ...values);
                    });
                }
                __(key, ...values) {
                    return Base._getI18n(key, ...values);
                }
                static __prom(key, ...values) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return Base._getI18n(key, ...values);
                    });
                }
                static __(key, ...values) {
                    return Base._getI18n(key, ...values);
                }
            };
        }
        BaseTypes._createBase = _createBase;
    })(BaseTypes = SSR.BaseTypes || (SSR.BaseTypes = {}));
    let _Attributes;
    (function (_Attributes) {
        function _isPrimitive(value) {
            return (value === null ||
                !(typeof value === 'object' || typeof value === 'function'));
        }
        _Attributes._isPrimitive = _isPrimitive;
        function _isIterable(value) {
            return (Array.isArray(value) ||
                !!(value && value[Symbol.iterator]));
        }
        _Attributes._isIterable = _isIterable;
        function _toString(value) {
            let text = '';
            if (_isPrimitive(value) || !_isIterable(value)) {
                if (typeof value !== 'object')
                    return String(value);
                if (value instanceof RegExp) {
                    return String(value);
                }
                return JSON.stringify(value);
            }
            else {
                for (const t of value) {
                    text += typeof t === 'string' ? t : String(t);
                }
            }
            return text;
        }
        _Attributes._toString = _toString;
        function _casingToDashes(name) {
            return name
                .replace(/([a-z\d])([A-Z])/g, '$1-$2')
                .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1-$2')
                .toLowerCase();
        }
        _Attributes._casingToDashes = _casingToDashes;
        function stringify(attributes) {
            if (Object.keys(attributes).length === 0) {
                return '';
            }
            const parts = [];
            for (const key in attributes) {
                if (!/^[a-z].*/.test(key))
                    continue;
                parts.push(`${_casingToDashes(key)}="${_toString(attributes[key]).replace(/"/g, '&quot;')}"`);
            }
            return ` ${parts.join(' ')}`;
        }
        _Attributes.stringify = stringify;
    })(_Attributes = SSR._Attributes || (SSR._Attributes = {}));
    let _Properties;
    (function (_Properties) {
        function splitAttributes(element, attributes) {
            if (!element.props || !element.props.__config)
                return {
                    attributes,
                    privateProps: {},
                    publicProps: {},
                };
            const config = element.props.__config;
            if (!config.reflect && !config.priv)
                return {
                    attributes,
                    privateProps: {},
                    publicProps: {},
                };
            const { reflect = {}, priv = {} } = config;
            const attribs = {};
            const privateProps = {};
            const publicProps = {};
            for (const key in attributes) {
                if (key in reflect) {
                    publicProps[key] = attributes[key];
                }
                else if (key in priv) {
                    privateProps[key] = attributes[key];
                }
                else {
                    attribs[key] = attributes[key];
                }
            }
            return {
                attributes: attribs,
                privateProps,
                publicProps,
            };
        }
        _Properties.splitAttributes = splitAttributes;
    })(_Properties = SSR._Properties || (SSR._Properties = {}));
    let _Rendering;
    (function (_Rendering) {
        let _Util;
        (function (_Util) {
            function mapAsyncInOrder(arr, handler) {
                return __awaiter(this, void 0, void 0, function* () {
                    const results = [];
                    for (const item of arr) {
                        results.push(yield handler(item));
                    }
                    return results;
                });
            }
            _Util.mapAsyncInOrder = mapAsyncInOrder;
        })(_Util = _Rendering._Util || (_Rendering._Util = {}));
        let Dependencies;
        (function (Dependencies) {
            function buildMap(element, map = {}) {
                if (element.is) {
                    map[element.is] = element;
                }
                /* istanbul ignore next */
                for (const dependency of element.dependencies || []) {
                    buildMap(dependency, map);
                }
                return map;
            }
            Dependencies.buildMap = buildMap;
        })(Dependencies = _Rendering.Dependencies || (_Rendering.Dependencies = {}));
        let TextToTags;
        (function (TextToTags) {
            class Tag {
                constructor({ tagName, attributes, isSelfClosing, children, }) {
                    this.config = {};
                    this._slotted = false;
                    this.type = 'TAG';
                    this.tagName = tagName;
                    this.attributes = attributes;
                    this.isSelfClosing = isSelfClosing;
                    this._children = children;
                }
                get children() {
                    return this._children;
                }
                copy() {
                    return new Tag({
                        attributes: this.attributes,
                        children: this.children,
                        isSelfClosing: this.isSelfClosing,
                        tagName: this.tagName,
                    });
                }
                setChildren(children) {
                    this._children = children;
                    return this;
                }
                get slotted() {
                    return this._slotted;
                }
                setSlotChildren(children) {
                    this._slotted = true;
                    return this.setChildren(children);
                }
                walk(handler) {
                    const result = handler(this);
                    const { stop, newTag } = result || {
                        stop: false,
                        newTag: this,
                    };
                    if (newTag instanceof TextTag || stop) {
                        return newTag;
                    }
                    return newTag
                        .copy()
                        .setChildren(newTag.children.map((c) => c.walk(handler)));
                }
                walkBottomUp(handler) {
                    return __awaiter(this, void 0, void 0, function* () {
                        this.setChildren(yield _Util.mapAsyncInOrder(this.children, (child) => child.walkBottomUp(handler)));
                        return (yield handler(this)) || this;
                    });
                }
                walkAll(handler) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const result = yield handler(this);
                        /* istanbul ignore next */
                        const newTag = result || this;
                        return newTag
                            .copy()
                            .setChildren(yield _Util.mapAsyncInOrder(newTag.children, (child) => child.walkAll(handler)));
                    });
                }
                toText() {
                    if (this.isSelfClosing && this.children.length === 0) {
                        return `<${this.tagName}${_Attributes.stringify(this.attributes)}/>`;
                    }
                    return `<${this.tagName}${_Attributes.stringify(this.attributes)}>${this._children.map((c) => c.toText()).join('')}</${this.tagName}>`;
                }
            }
            TextToTags.Tag = Tag;
            class TextTag {
                constructor({ content }) {
                    this.type = 'TEXT';
                    this.content = content;
                }
                walk() {
                    return this;
                }
                walkBottomUp() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return this;
                    });
                }
                walkAll(handler) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return (yield handler(this)) || this;
                    });
                }
                toText() {
                    return this.content;
                }
            }
            TextToTags.TextTag = TextTag;
            let _Parser;
            (function (_Parser) {
                _Parser._VOID_TAGS = [
                    'area',
                    'base',
                    'br',
                    'col',
                    'embed',
                    'hr',
                    'img',
                    'input',
                    'keygen',
                    'link',
                    'menuitem',
                    'meta',
                    'param',
                    'source',
                    'track',
                    'wbr',
                ];
                function _getDOM(text) {
                    const handler = new DomHandler();
                    const parser = new HTMLParser(handler);
                    parser.write(text);
                    parser.end();
                    return handler.dom;
                }
                _Parser._getDOM = _getDOM;
                function _domToTags(dom, { tagBase = Tag, textBase = TextTag } = {}) {
                    return dom
                        .map((node) => {
                        if (node.type === 'text') {
                            const dataNode = node;
                            return new textBase({
                                content: dataNode.nodeValue,
                            });
                        }
                        else if (node.type === 'tag' ||
                            node.type === 'style' ||
                            node.type === 'script') {
                            const tagNode = node;
                            return new tagBase({
                                attributes: tagNode.attribs,
                                children: _domToTags(tagNode.children, { tagBase, textBase }),
                                isSelfClosing: _Parser._VOID_TAGS.includes(tagNode.tagName.toLowerCase()),
                                tagName: tagNode.tagName,
                            });
                        }
                        return undefined;
                    })
                        .filter((v) => !!v);
                }
                _Parser._domToTags = _domToTags;
                function parse(text, tagConfig) {
                    const dom = _getDOM(text);
                    return _domToTags(dom, tagConfig);
                }
                _Parser.parse = parse;
            })(_Parser = TextToTags._Parser || (TextToTags._Parser = {}));
            let Replacement;
            (function (Replacement) {
                let Slots;
                (function (Slots) {
                    function findSlotReceivers(root) {
                        const slots = {
                            named: {},
                            unnamed: null,
                        };
                        root.forEach((t) => t.walk((tag) => {
                            if (tag.tagName === 'slot') {
                                if (tag.slotted) {
                                    return { newTag: tag, stop: true };
                                }
                                if (tag.attributes.hasOwnProperty('name')) {
                                    const { name: slotName, } = tag.attributes;
                                    slots.named[slotName] =
                                        slots.named[slotName] || tag;
                                }
                                else {
                                    if (!slots.unnamed) {
                                        slots.unnamed = tag;
                                    }
                                }
                                return {
                                    newTag: tag,
                                    stop: true,
                                };
                            }
                            return;
                        }));
                        return slots;
                    }
                    Slots.findSlotReceivers = findSlotReceivers;
                    function _findSlottables(root) {
                        const slottables = {
                            named: {},
                            unnamed: [],
                        };
                        root.forEach((t) => t.walk((tag) => {
                            if (tag.attributes.hasOwnProperty('slot')) {
                                const slotName = tag.attributes.slot;
                                slottables.named[slotName] =
                                    slottables.named[slotName] || tag;
                            }
                            else {
                                slottables.unnamed.push(tag);
                            }
                            return {
                                newTag: tag,
                                stop: true,
                            };
                        }));
                        return slottables;
                    }
                    Slots._findSlottables = _findSlottables;
                    function _replaceSlots(receivers, slottables) {
                        for (const slotName in slottables.named) {
                            const slottable = slottables.named[slotName];
                            if (receivers.named[slotName]) {
                                receivers.named[slotName].setChildren([
                                    slottable,
                                ]);
                            }
                        }
                        if (receivers.unnamed) {
                            receivers.unnamed.setSlotChildren(slottables.unnamed);
                        }
                    }
                    Slots._replaceSlots = _replaceSlots;
                    function applySlots(element, lightDOM) {
                        const receivers = findSlotReceivers(element.children);
                        const slottables = _findSlottables(lightDOM.children);
                        _replaceSlots(receivers, slottables);
                    }
                    Slots.applySlots = applySlots;
                })(Slots = Replacement.Slots || (Replacement.Slots = {}));
                function _applyOverriddenAttributes(tag, markers, session) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const overrides = {};
                        const attributes = {};
                        for (const attributeName in tag.attributes) {
                            const attributeValue = tag.attributes[attributeName];
                            if (!(yield _ComplexRender.markerHas(markers, attributeValue))) {
                                attributes[attributeName] = attributeValue;
                            }
                            else {
                                overrides[attributeName] = yield _ComplexRender.markerGetValue(markers, attributeValue, session._doWait || false);
                            }
                        }
                        return {
                            overrides,
                            attributes,
                        };
                    });
                }
                Replacement._applyOverriddenAttributes = _applyOverriddenAttributes;
                function _mapTag(tag, session, markers) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!tag.tagName.includes('-') ||
                            !session._elementMap.hasOwnProperty(tag.tagName))
                            return;
                        const element = session._elementMap[tag.tagName];
                        const { attributes, overrides: props, } = yield _applyOverriddenAttributes(tag, markers, session);
                        const newTag = yield elementToTag(element, props, attributes, session);
                        Slots.applySlots(newTag, tag);
                        return newTag;
                    });
                }
                Replacement._mapTag = _mapTag;
                function replace(tags, session, markers) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield _Util.mapAsyncInOrder(tags, (t) => t.walkBottomUp((tag) => {
                            return _mapTag(tag, session, markers);
                        }));
                    });
                }
                Replacement.replace = replace;
            })(Replacement = TextToTags.Replacement || (TextToTags.Replacement = {}));
            let _CSS;
            (function (_CSS) {
                class CSSTag extends TextToTags.Tag {
                    constructor({ tagName, attributes, isSelfClosing, children, }) {
                        super({ tagName, attributes, isSelfClosing, children });
                        this._cssChildren = children;
                    }
                    get children() {
                        return this._cssChildren;
                    }
                    get elementGlobal() {
                        return (this._changeOn === 2 /* THEME */ ||
                            !!(this._changeOn === 0 /* NEVER */));
                    }
                    setChangeOn(changeOn) {
                        this.children.forEach((c) => c.setChangeOn(changeOn));
                        this._changeOn = changeOn;
                    }
                }
                _CSS.CSSTag = CSSTag;
                class CSSText extends TextToTags.TextTag {
                    constructor({ content }) {
                        super({ content });
                        this._stylesheet = null;
                        this.content = content;
                    }
                    setChangeOn(changeOn) {
                        this._changeOn = changeOn;
                    }
                    parse() {
                        try {
                            return parseCSS(this.content);
                        }
                        catch (e) {
                            Errors._cssParseError(e, this.content);
                        }
                    }
                    get cssParsed() {
                        if (this._stylesheet)
                            return this._stylesheet;
                        return (this._stylesheet = this.parse());
                    }
                    get stylesheet() {
                        return this.cssParsed.stylesheet;
                    }
                    addPrefix(prefix) {
                        /* istanbul ignore next */
                        if (!this.stylesheet)
                            return;
                        const stylesheet = this.stylesheet;
                        stylesheet.rules = stylesheet.rules.map((line) => {
                            /* istanbul ignore next */
                            if (!('selectors' in line))
                                return line;
                            const rule = line;
                            /* istanbul ignore next */
                            if (!rule.selectors)
                                return line;
                            rule.selectors = rule.selectors.map((selector) => {
                                return selector
                                    .split(' ')
                                    .map((part) => part.trim())
                                    .filter((v) => v.length)
                                    .map((rulePart) => {
                                    if (rulePart === '*')
                                        return `.${prefix}`;
                                    if (rulePart.length === 1 &&
                                        !/[a-z|A-Z]/.test(rulePart))
                                        return rulePart;
                                    if (rulePart.includes(':')) {
                                        const pseudo = rulePart.includes('::')
                                            ? '::'
                                            : ':';
                                        const [prePseudo, pseudoSelector,] = rulePart.split(pseudo);
                                        return `${prePseudo}.${prefix}${pseudo}${pseudoSelector}`;
                                    }
                                    return `${rulePart}.${prefix}`;
                                })
                                    .join(' ');
                            });
                            return rule;
                        });
                    }
                    stringify() {
                        this.content = stringifyCSS(this.cssParsed);
                    }
                }
                _CSS.CSSText = CSSText;
                function _parseElementCSS(element, instance) {
                    /* istanbul ignore next */
                    if (!element.css)
                        return [];
                    const templates = Array.isArray(element.css)
                        ? element.css
                        : [element.css];
                    return templates.map((template) => {
                        const text = _tryRender(() => {
                            return (
                            /* istanbul ignore next */
                            (template === null || template === void 0 ? void 0 : template.renderAsText(63 /* ALWAYS */, instance)) || '');
                        });
                        const cssTags = TextToTags._Parser.parse(text, {
                            tagBase: CSSTag,
                            textBase: CSSText,
                        });
                        const styleTags = cssTags.filter((t) => {
                            return t.type === 'TAG';
                        });
                        styleTags.forEach((t) => t.setChangeOn(template.changeOn));
                        return styleTags.map((styleTag) => new Tag({
                            attributes: {
                                'data-type': 'css',
                            },
                            children: [styleTag],
                            isSelfClosing: false,
                            tagName: 'span',
                        }));
                    });
                }
                _CSS._parseElementCSS = _parseElementCSS;
                function _generateUniqueID(element, tagName, session) {
                    if (!session._cssIdentifierMap.has(element)) {
                        session._cssIdentifierMap.set(element, 0);
                    }
                    const num = session._cssIdentifierMap.get(element);
                    session._cssIdentifierMap.set(element, num + 1);
                    return `css-${tagName}-${num}`;
                }
                _CSS._generateUniqueID = _generateUniqueID;
                function _generateComponentID(tagName) {
                    return `css-${tagName}`;
                }
                _CSS._generateComponentID = _generateComponentID;
                function _addCSSPrefixes(templates, uniqueID, componentID) {
                    return templates.map((templateWrappers) => {
                        return templateWrappers.map((templateWrapper) => {
                            const sheet = templateWrapper.children[0];
                            const prefix = sheet.elementGlobal
                                ? componentID
                                : uniqueID;
                            sheet.children.map((tag) => {
                                tag.addPrefix(prefix);
                                tag.stringify();
                            });
                            return templateWrapper;
                        });
                    });
                }
                _CSS._addCSSPrefixes = _addCSSPrefixes;
                function _addHTMLPrefixes(tags, uniqueID, componentID) {
                    return tags.map((tagClass) => {
                        return tagClass.walk((tag) => {
                            const classNames = (() => {
                                if (!tag.attributes['class'])
                                    return [];
                                const classNames = tag.attributes
                                    .class;
                                return classNames.split(' ');
                            })();
                            classNames.push(uniqueID, componentID);
                            tag.attributes.class = classNames.join(' ');
                            return {
                                newTag: tag,
                                stop: false,
                            };
                        });
                    });
                }
                _CSS._addHTMLPrefixes = _addHTMLPrefixes;
                function _flatten(values) {
                    const result = [];
                    for (const arr of values) {
                        if (Array.isArray(arr)) {
                            result.push(...arr);
                        }
                        else {
                            result.push(arr);
                        }
                    }
                    return result;
                }
                _CSS._flatten = _flatten;
                function getCSSApplied(element, instance, tagName, children, session) {
                    const uniqueID = _generateUniqueID(element, tagName, session);
                    const componentID = _generateComponentID(tagName);
                    const parsed = _parseElementCSS(element, instance);
                    const prefixedCSS = _flatten(_addCSSPrefixes(parsed, uniqueID, componentID));
                    const htmlPrefixed = _addHTMLPrefixes(children, uniqueID, componentID);
                    const isFirstElementRender = !session._sheetSet.has(element);
                    session._sheetSet.add(element);
                    return [
                        ...(isFirstElementRender
                            ? _flatten(prefixedCSS.filter((s) => s.children[0]
                                .elementGlobal))
                            : []),
                        ..._flatten(prefixedCSS.filter((s) => !s.children[0].elementGlobal)),
                        ...htmlPrefixed,
                    ];
                }
                _CSS.getCSSApplied = getCSSApplied;
            })(_CSS = TextToTags._CSS || (TextToTags._CSS = {}));
            function _tryRender(renderFunction) {
                try {
                    return renderFunction();
                }
                catch (e) {
                    Errors._renderError(e);
                }
            }
            TextToTags._tryRender = _tryRender;
            let _ComplexRender;
            (function (_ComplexRender) {
                _ComplexRender._markedIndex = 0;
                function _templateToMarkedString({ strings, values, }) {
                    const markers = [];
                    const result = [strings[0]];
                    for (let i = 0; i < values.length; i++) {
                        const marker = `___marker${_ComplexRender._markedIndex++}___`;
                        result.push(marker, strings[i + 1]);
                        markers.push([marker, values[i], {}]);
                    }
                    return {
                        text: result.join(''),
                        markers,
                    };
                }
                _ComplexRender._templateToMarkedString = _templateToMarkedString;
                function _getPreAttrRemoved(resultStrings, config) {
                    let sliceChars = config.attrName.length + 1;
                    if (resultStrings[resultStrings.length - 1].endsWith('"') ||
                        resultStrings[resultStrings.length - 1].endsWith("'")) {
                        // Quoted
                        sliceChars++;
                    }
                    return resultStrings[resultStrings.length - 1].slice(0, -sliceChars);
                }
                _ComplexRender._getPreAttrRemoved = _getPreAttrRemoved;
                function _ensurePostQuote(str) {
                    const nextChar = str[0];
                    if (nextChar !== '"') {
                        if (nextChar === "'") {
                            // Replace with "
                            return `"${str.slice(1)}`;
                        }
                        else {
                            // No quote, add a quote
                            return `"${str}`;
                        }
                    }
                    return str;
                }
                _ComplexRender._ensurePostQuote = _ensurePostQuote;
                function _ensureNoPostQuote(str) {
                    const nextChar = str[0];
                    if (nextChar === '"' || nextChar === "'") {
                        return str.slice(1);
                    }
                    return str;
                }
                _ComplexRender._ensureNoPostQuote = _ensureNoPostQuote;
                function _finalMarkedToString(strings, markers, session) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const result = [strings[0]];
                        for (let i = 0; i < strings.length - 1; i++) {
                            const [marker, value, config] = markers[i];
                            const evaluatedValue = session._doWait
                                ? yield value
                                : value;
                            if (config.isTag && config.attrName.startsWith('?')) {
                                result[result.length - 1] = _getPreAttrRemoved(result, config);
                                if (evaluatedValue) {
                                    result.push(`${config.attrName.slice(1)}="`);
                                    result.push(_ensurePostQuote(strings[i + 1]));
                                }
                                else {
                                    result.push(_ensureNoPostQuote(strings[i + 1]));
                                }
                            }
                            else if (config.forceMarker) {
                                result.push(marker, strings[i + 1]);
                            }
                            else if (config.isTag &&
                                !_Attributes._isPrimitive(evaluatedValue)) {
                                // Delete it altogether
                                result[result.length - 1] = _getPreAttrRemoved(result, config);
                                result.push(_ensureNoPostQuote(strings[i + 1]));
                            }
                            else {
                                result.push(evaluatedValue, strings[i + 1]);
                            }
                        }
                        return result.join('');
                    });
                }
                _ComplexRender._finalMarkedToString = _finalMarkedToString;
                function _complexContentToString(content, session) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!_Attributes._isPrimitive(content)) {
                            if (Array.isArray(content)) {
                                const mappedContent = yield _Util.mapAsyncInOrder(content, (v) => __awaiter(this, void 0, void 0, function* () {
                                    const { isComplex, str, markers, } = yield _complexContentToString(v, session);
                                    if (isComplex)
                                        return {
                                            str,
                                            markers,
                                        };
                                    return {
                                        str: v,
                                        markers: [],
                                    };
                                }));
                                const joinedStrings = mappedContent
                                    .map((c) => c.str)
                                    .join('');
                                const joinedMarkers = mappedContent.reduce((prev, current) => {
                                    return [...prev, ...current.markers];
                                }, []);
                                return {
                                    isComplex: true,
                                    str: joinedStrings,
                                    markers: joinedMarkers,
                                };
                            }
                            if ('values' in content && 'strings' in content) {
                                const { markers, str, } = yield _complexRenderedToText(content, session);
                                return {
                                    isComplex: true,
                                    str,
                                    markers,
                                };
                            }
                        }
                        return { isComplex: false, markers: [] };
                    });
                }
                _ComplexRender._complexContentToString = _complexContentToString;
                function markerHas(markers, value) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return ((yield markerGetAll(markers, value, false)).length > 0);
                    });
                }
                _ComplexRender.markerHas = markerHas;
                function markerGetValue(markers, value, doWait) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const markerValue = markers
                            .filter(([marker]) => {
                            return value.includes(marker);
                        })
                            .map(([, markerValue]) => markerValue)[0];
                        if (doWait) {
                            return yield markerValue;
                        }
                        return markerValue;
                    });
                }
                _ComplexRender.markerGetValue = markerGetValue;
                function markerGetAll(markers, value, doWait) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const values = markers.filter(([marker]) => {
                            return value.includes(marker);
                        });
                        if (doWait) {
                            return yield Promise.all(values.map(([key, value]) => __awaiter(this, void 0, void 0, function* () {
                                return [
                                    key,
                                    yield value,
                                ];
                            })));
                        }
                        return values;
                    });
                }
                _ComplexRender.markerGetAll = markerGetAll;
                function _markerSet(markers, keyMarker, value, config) {
                    for (let i = 0; i < markers.length; i++) {
                        const [marker] = markers[i];
                        if (marker === keyMarker) {
                            markers[i][1] = value;
                            if (config) {
                                markers[i][2] = Object.assign(Object.assign({}, markers[i][2]), config);
                            }
                            return;
                        }
                    }
                }
                _ComplexRender._markerSet = _markerSet;
                function _applyComplexToTag(tag, markers, session) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (tag.type === 'TEXT') {
                            const value = tag.content.trim();
                            if (!(yield markerHas(markers, value))) {
                                return;
                            }
                            const markedArr = yield markerGetAll(markers, value, session._doWait || false);
                            // Check if there is an object-like in the DOM
                            yield _Util.mapAsyncInOrder(markedArr, ([markedKey, markedValue]) => __awaiter(this, void 0, void 0, function* () {
                                const { isComplex, str, markers: contentMarkers, } = yield _complexContentToString(markedValue, session);
                                markers.push(...contentMarkers);
                                if (isComplex) {
                                    _markerSet(markers, markedKey, str);
                                }
                            }));
                        }
                        else {
                            const attrValues = Object.assign({}, tag.attributes);
                            for (const attrName in tag.attributes) {
                                const attrValue = tag.attributes[attrName];
                                if (!(yield markerHas(markers, attrValue)))
                                    continue;
                                const marked = (yield markerGetAll(markers, attrValue, session._doWait || false)).map(([, val]) => val);
                                if (attrName === 'class') {
                                    const classString = classNames(marked);
                                    attrValues[attrName] = classString;
                                    _markerSet(markers, attrValue, classString);
                                }
                                else if (attrName === 'style') {
                                    const markedValue = marked[0];
                                    const value = (() => {
                                        if (typeof markedValue === 'string' ||
                                            typeof markedValue === 'number') {
                                            return markedValue;
                                        }
                                        return StyleAttributePart.getStyleString(markedValue);
                                    })();
                                    attrValues[attrName] = value;
                                    _markerSet(markers, attrValue, value);
                                }
                                else {
                                    _markerSet(markers, attrValue, marked[0], {
                                        isTag: true,
                                        attrName,
                                    });
                                }
                            }
                            if (tag.tagName.includes('-')) {
                                // Output markers and resolve to map
                                for (const attrName in tag.attributes) {
                                    const attrValue = tag.attributes[attrName];
                                    if (!(yield markerHas(markers, attrValue)))
                                        continue;
                                    _markerSet(markers, attrValue, markerGetValue(markers, attrValue, session._doWait || false), {
                                        forceMarker: true,
                                    });
                                }
                                tag.config.attributeOverride = attrValues;
                            }
                        }
                    });
                }
                _ComplexRender._applyComplexToTag = _applyComplexToTag;
                function _complexRenderedToText(renderedTemplate, session) {
                    return __awaiter(this, void 0, void 0, function* () {
                        // Render to text with markers inserted
                        const textRenderedMarked = _templateToMarkedString(renderedTemplate);
                        // Check if values at those markers contain anything special
                        const parsedMarked = _Parser.parse(textRenderedMarked.text);
                        for (const parsedTag of parsedMarked) {
                            yield parsedTag.walkAll((tag) => __awaiter(this, void 0, void 0, function* () {
                                yield _applyComplexToTag(tag, textRenderedMarked.markers, session);
                            }));
                        }
                        // Convert the old template to text again with new values
                        return {
                            str: yield _finalMarkedToString(renderedTemplate.strings, textRenderedMarked.markers, session),
                            markers: textRenderedMarked.markers,
                        };
                    });
                }
                _ComplexRender._complexRenderedToText = _complexRenderedToText;
                function renderToText(instance, template, session) {
                    return __awaiter(this, void 0, void 0, function* () {
                        /* istanbul ignore next */
                        if (!template)
                            return {
                                str: '',
                                markers: [],
                            };
                        const renderedTemplate = _tryRender(() => {
                            return template.renderTemplate(63 /* ALWAYS */, instance);
                        });
                        if (typeof renderedTemplate !== 'object' ||
                            !('values' in renderedTemplate) ||
                            !('strings' in renderedTemplate)) {
                            return {
                                str: template.renderAsText(63 /* ALWAYS */, instance),
                                markers: [],
                            };
                        }
                        return yield _complexRenderedToText(renderedTemplate, session);
                    });
                }
                _ComplexRender.renderToText = renderToText;
            })(_ComplexRender = TextToTags._ComplexRender || (TextToTags._ComplexRender = {}));
            function elementToTag(element, props, attribs, session, isRoot = false) {
                return __awaiter(this, void 0, void 0, function* () {
                    const tagName = element.is ||
                        `wclib-element${session._unnamedElements.amount++}`;
                    const wrappedClass = BaseTypes._createBase(element, tagName, props, attribs, session);
                    const instance = new wrappedClass();
                    const { str, markers } = yield _ComplexRender.renderToText(instance, element.html, session);
                    const htmlTag = new Tag({
                        attributes: {
                            'data-type': 'html',
                        },
                        children: _Parser.parse(str),
                        isSelfClosing: false,
                        tagName: 'span',
                    });
                    if (isRoot &&
                        _Rendering.TextToTags.Replacement.Slots.findSlotReceivers([
                            htmlTag,
                        ]).unnamed) {
                        throw new Error("Root element can't have unnamed slots as children");
                    }
                    const { attributes, publicProps } = _Properties.splitAttributes(instance, Object.assign(Object.assign({}, props), attribs));
                    const cssApplied = _CSS.getCSSApplied(element, instance, tagName, [htmlTag], session);
                    const children = yield Replacement.replace(cssApplied, session, markers);
                    return new Tag({
                        tagName,
                        attributes: Object.assign(Object.assign(Object.assign({}, attributes), publicProps), instance._attributes),
                        isSelfClosing: false,
                        children: children,
                    });
                });
            }
            TextToTags.elementToTag = elementToTag;
        })(TextToTags = _Rendering.TextToTags || (_Rendering.TextToTags = {}));
        function render(element, props, attributes, session) {
            return __awaiter(this, void 0, void 0, function* () {
                const dom = yield TextToTags.elementToTag(element, props, attributes, session, true);
                return dom.toText();
            });
        }
        _Rendering.render = render;
    })(_Rendering = SSR._Rendering || (SSR._Rendering = {}));
    function renderElement(element, { attributes, documentSession = new DocumentSession(), i18n, props, theme, getMessage, lang, themeName, await: doWait = false, }) {
        return __awaiter(this, void 0, void 0, function* () {
            documentSession._elementMap = Object.assign(Object.assign({}, documentSession._elementMap), _Rendering.Dependencies.buildMap(element));
            const session = documentSession
                .clone()
                .mergeConfig({ i18n, theme, getMessage, lang, themeName, doWait });
            return yield _Rendering.render(element, props || {}, attributes || {}, session);
        });
    }
    SSR.renderElement = renderElement;
})(SSR || (SSR = {}));
/**
 * Render a single element to a string that can be written to a server's client. If no
 *  document session is passed, treats the element as if it's the only element in the
 *  document. If you want to render multiple elements for the same document,
 *  use `createSSRSession`.
 *
 * @param {SSR.BaseTypes.BaseClass} element - The element to render
 * @param {SSRConfig} [config] - Config for the render
 * @param { { [key: string]: any } } [config.props] - Props to pass to the element
 * @param { { [key: string]: any } } [config.attributes] - HTML attributes to apply to the element
 * @param { { [key: string]: any } } [config.theme] - A theme to apply to the element
 * @param { { [key: string]: any } } [config.themeName] - The name of the theme for the element
 * @param { { [key: string]: any } } [config.lang] - The language for the element
 * @param { any } [config.i18n] - The i8n to apply to the element
 * @param { SSR.GetMessageFunction } [config.getMessage] - The
 *  function called when an i18n message is fetched
 * @param {SSR.DocumentSession} [config.documentSession] - The document session to use (remembers theme and i18n)
 * @param { boolean } [config.await] - Whether to await template values
 *
 * @returns {Promise<string>} The rendered element
 */
export function ssr(element, config = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield SSR.renderElement(element, config);
    });
}
/**
 * Create a document rendering session. Pass the returned document to `ssr` to
 *  preserve the state of the document, avoiding conflicts
 *
 * @returns {SSR.DocumentSession} A document rendering session's variables
 */
export function createSSRSession(config = {}) {
    return new SSR.DocumentSession(config);
}
//# sourceMappingURL=ssr.js.map