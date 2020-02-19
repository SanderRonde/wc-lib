import {
    parse as parseCSS,
    Stylesheet,
    stringify as stringifyCSS,
    Rule,
} from 'css';
import { Parser as HTMLParser, DomHandler } from 'htmlparser2';
import { DataNode, Element } from 'domhandler';

import {
    WebComponentBaseTypeInstance,
    InferInstance,
    WebComponentTypeInstance,
    WebComponentBaseTypeStatic,
    WebComponentTypeStatic,
} from '../../classes/types';
import { CHANGE_TYPE, TemplateFnLike } from '../template-fn';
import { ComplexValue } from '../template-manager';
import { classNames } from '../shared';
import { Props } from '../props';

/**
 * The serverside rendering namespace that is used internally to do the whole
 * operation. The entire thing and its contents are exported but only the
 * "useful" exports are not prefixed with an underscore. This means you can
 * always access anything but can still distinguish between code that
 * should or should not be imported.
 */
export namespace SSR {
    export namespace Errors {
        export class RenderError extends Error {
            constructor(message: string, public source: Error) {
                super(message);

                this.name = 'RenderError';
                this.message = `Error while rendering component on the server: ${source.name}, ${source.message}`;
                this.stack = source.stack;
            }
        }

        export class CSSParseError extends Error {
            constructor(
                message: string,
                public source: Error,
                public file: string
            ) {
                super(message);

                this.name = 'CSSParseError';
                this.message = `Error while parsing rendered CSS: ${source.name}, ${source.message}\n${source.stack}\nIn CSS file: ${file}`;
                this.stack = source.stack;
            }
        }

        export function _renderError(e: Error): never {
            throw new RenderError(e.message, e);
        }

        export function _cssParseError(e: Error, file: string): never {
            throw new CSSParseError(e.message, e, file);
        }
    }

    export class MergableWeakMap<K extends object, V> implements WeakMap<K, V> {
        private _maps: WeakMap<K, V>[] = [new WeakMap()];

        merge(map: MergableWeakMap<K, V>) {
            this._maps.push(...map._maps);
            return this;
        }

        delete(key: K) {
            let deleted: boolean = false;
            for (const map of this._maps) {
                if (map.delete(key)) {
                    deleted = true;
                }
            }
            return deleted;
        }

        get(key: K) {
            for (const map of this._maps) {
                if (map.has(key)) {
                    return map.get(key);
                }
            }
            return undefined;
        }

        has(key: K) {
            for (const map of this._maps) {
                if (map.has(key)) return true;
            }
            return false;
        }

        set(key: K, value: V) {
            this._maps[0].set(key, value);
            return this;
        }

        clone() {
            const newMap = new MergableWeakMap<K, V>();

            // Setting is performed on the first map so this should
            // create a readonly clone
            newMap._maps.push(...this._maps);
            return newMap;
        }

        [Symbol.toStringTag] = this._maps[0][Symbol.toStringTag];
    }

    export class MergableWeakSet<T extends object> implements WeakSet<T> {
        private _sets: WeakSet<T>[] = [new WeakSet()];

        merge(set: MergableWeakSet<T>) {
            this._sets.push(...set._sets);
            return this;
        }

        delete(value: T) {
            let deleted: boolean = false;
            for (const set of this._sets) {
                if (set.delete(value)) {
                    deleted = true;
                }
            }
            return deleted;
        }

        has(value: T) {
            for (const set of this._sets) {
                if (set.has(value)) return true;
            }
            return false;
        }

        add(value: T) {
            this._sets[0].add(value);
            return this;
        }

        clone() {
            const newSet = new MergableWeakSet<T>();

            // Setting is performed on the first set so this should
            // create a readonly clone
            newSet._sets.push(...this._sets);
            return newSet;
        }

        [Symbol.toStringTag] = this._sets[0][Symbol.toStringTag];
    }

    export interface GetMessageFunction {
        (langFile: any, key: string, values: any[]): string | Promise<string>;
    }

    export interface DocumentConfig {
        theme?: SSR.BaseTypes.Theme;
        i18n?: any;
        getMessage?: GetMessageFunction;
    }

    export class DocumentSession {
        _i18n?: any;
        _theme?: SSR.BaseTypes.Theme;
        _getMessage?: GetMessageFunction;

        _cssIdentifierMap: MergableWeakMap<
            BaseTypes.BaseClass,
            number
        > = new MergableWeakMap();
        _sheetSet: MergableWeakSet<BaseTypes.BaseClass> = new MergableWeakSet();

        // This is an object so that references to it are updated
        _unnamedElements = {
            amount: 0,
        };

        _elementMap: BaseTypes.DependencyMap = {};

        constructor({ i18n, theme, getMessage }: DocumentConfig = {}) {
            this._i18n = i18n;
            this._theme = theme;
            this._getMessage = getMessage;
        }

        /**
         * Merge a config into this SSR session, prioritizing config over current state
         */
        mergeConfig({ i18n, theme, getMessage }: DocumentConfig) {
            this._i18n = i18n || this._i18n;
            this._theme = theme || this._theme;
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
        merge(session: DocumentSession): DocumentSession {
            return DocumentSession.merge(this, session);
        }

        /**
         * Clone this document session and preserve any object links.
         * Any changes to the clone **are** reflected to the original.
         *
         * @returns {DocumentSession} The clone
         */
        clone(): DocumentSession {
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
        static merge<T extends DocumentSession>(
            target: T,
            ...sessions: DocumentSession[]
        ): T {
            for (const session of sessions) {
                target._i18n = session._i18n || target._i18n;
                target._theme = session._theme || target._theme;
                target._getMessage = session._getMessage || target._getMessage;

                target._cssIdentifierMap = session._cssIdentifierMap.merge(
                    session._cssIdentifierMap
                );
                target._sheetSet = session._sheetSet.merge(session._sheetSet);

                target._unnamedElements = {
                    amount: Math.max(
                        session._unnamedElements.amount,
                        session._unnamedElements.amount
                    ),
                };

                target._elementMap = {
                    ...session._elementMap,
                    ...target._elementMap,
                };
            }
            return target;
        }
    }

    export namespace BaseTypes {
        export interface BaseClassInstance
            extends WebComponentBaseTypeInstance,
                WebComponentTypeInstance {
            getTheme?(): Theme;
            genRef?(value: ComplexValue): string;
            getRef?(ref: string): ComplexValue;
        }

        export type BaseClass = WebComponentBaseTypeStatic &
            WebComponentTypeStatic & {
                new (): BaseClassInstance;

                dependencies?: any[] | null;
                is?: string | null;
                html?: TemplateFnLike<number> | null;
                css?: TemplateFnLike<number> | TemplateFnLike<number>[] | null;
            };

        export interface BaseClassInstanceExtended extends BaseClassInstance {
            _attributes: {
                [key: string]: string;
            };
            isSSR: boolean;
        }

        export interface BaseClassExtended extends BaseClass {
            new (): BaseClassInstanceExtended;
        }

        export type DependencyMap = Object & {
            [key: string]: BaseTypes.BaseClass;
        };

        export type StringMap<V> = {
            [key: string]: V;
        };

        export type Theme = StringMap<any>;

        export type Props = Object & StringMap<any>;

        export type Attributes = Object & StringMap<any>;

        export type TextAttributes = Object & StringMap<any>;

        export function _createBase<
            C extends {
                new (...args: any[]): {
                    genRef?(value?: ComplexValue): string;
                    getRef?(ref: string): ComplexValue;
                };
            }
        >(
            klass: C,
            tagName: string,
            props: BaseTypes.Props,
            attributes: BaseTypes.Attributes,
            session: DocumentSession
        ): BaseClassExtended {
            const joinedAttributes = { ...attributes, ...props };
            const refMap: Map<string, any> = new Map();

            return (class Base extends klass {
                get isSSR() {
                    return true;
                }

                get tagName() {
                    return tagName;
                }

                constructor(...args: any[]) {
                    super(...args);

                    Props.onConnect(this);
                }
                getParentRef(ref: string): ComplexValue {
                    // There is no real parent here so refer back to the ref-hoster
                    // which is itself
                    return this.getRef!(ref);
                }
                getAttribute(name: string): string {
                    const value = joinedAttributes[name];
                    if (_Attributes._isPrimitive(value)) {
                        return String(value);
                    }

                    // Generate ref instead
                    if (refMap.has(name)) {
                        return refMap.get(name);
                    }

                    const ref =
                        'genRef' in this && this.genRef
                            ? this.genRef(value)
                            : String(value);

                    refMap.set(name, ref);
                    return ref;
                }
                hasAttribute(name: string): boolean {
                    return joinedAttributes.hasOwnProperty(name);
                }
                setAttribute(name: string, value: string) {
                    joinedAttributes[name] = value;
                }
                removeAttribute(name: string) {
                    delete joinedAttributes[name];
                }
                getTheme() {
                    return session._theme;
                }
                private static _getI18n(key: string, ...values: any[]) {
                    if (!session._i18n) return undefined;
                    if (session._getMessage) {
                        return session._getMessage(session._i18n, key, values);
                    }
                    return session._i18n[key];
                }
                async __prom(
                    key: string,
                    ...values: any[]
                ): Promise<string | undefined> {
                    return Base._getI18n(key, ...values);
                }

                __(key: string, ...values: any[]): string | undefined {
                    return Base._getI18n(key, ...values);
                }

                static async __prom(
                    key: string,
                    ...values: any[]
                ): Promise<string> {
                    return Base._getI18n(key, ...values);
                }

                static __(key: string, ...values: any[]): string {
                    return Base._getI18n(key, ...values);
                }
            } as unknown) as BaseClassExtended;
        }
    }

    export namespace _Attributes {
        export type Primitive =
            | null
            | undefined
            | boolean
            | number
            | string
            | Symbol
            | bigint;

        export function _isPrimitive(value: unknown): value is Primitive {
            return (
                value === null ||
                !(typeof value === 'object' || typeof value === 'function')
            );
        }

        export function _isIterable(
            value: unknown
        ): value is Iterable<unknown> {
            return (
                Array.isArray(value) ||
                !!(value && (value as any)[Symbol.iterator])
            );
        }

        export function _toString(value: any): string {
            let text: string = '';
            if (_isPrimitive(value) || !_isIterable(value)) {
                if (typeof value !== 'object') return String(value);
                if (value instanceof RegExp) {
                    return String(value);
                }
                return JSON.stringify(value);
            } else {
                for (const t of value) {
                    text += typeof t === 'string' ? t : String(t);
                }
            }
            return text;
        }

        export function _dashesToCasing(name: string) {
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
            return newStr;
        }

        export function stringify(attributes: BaseTypes.Attributes) {
            if (Object.keys(attributes).length === 0) {
                return '';
            }

            const parts = [];
            for (const key in attributes) {
                parts.push(
                    `${_dashesToCasing(key)}="${_toString(
                        attributes[key]
                    ).replace(/"/g, '&quot;')}"`
                );
            }
            return ` ${parts.join(' ')}`;
        }
    }

    export namespace _Properties {
        export function splitAttributes<A extends BaseTypes.Attributes>(
            element: BaseTypes.BaseClassInstance,
            attributes: A
        ): {
            attributes: BaseTypes.Attributes;
            publicProps: BaseTypes.Attributes;
            privateProps: BaseTypes.Attributes;
        } {
            if (!element.props || !(element.props as Props).__config)
                return {
                    attributes,
                    privateProps: {},
                    publicProps: {},
                };

            const config = (element.props as Props).__config;
            if (!config.reflect && !config.priv)
                return {
                    attributes,
                    privateProps: {},
                    publicProps: {},
                };
            const { reflect = {}, priv = {} } = config;

            const attribs: Partial<A> & Object = {};
            const privateProps: Partial<A> & Object = {};
            const publicProps: Partial<A> & Object = {};

            for (const key in attributes) {
                if (key in reflect) {
                    publicProps[key] = attributes[key];
                } else if (key in priv) {
                    privateProps[key] = attributes[key];
                } else {
                    attribs[key] = attribs[key];
                }
            }

            return {
                attributes: attribs,
                privateProps,
                publicProps,
            };
        }
    }

    export namespace _Rendering {
        export namespace Dependencies {
            export function buildMap(
                element: BaseTypes.BaseClass,
                map: BaseTypes.DependencyMap = {}
            ) {
                if (element.is) {
                    map[element.is] = element;
                }

                /* istanbul ignore next */
                for (const dependency of element.dependencies || []) {
                    buildMap(dependency, map);
                }

                return map;
            }
        }

        export namespace TextToTags {
            export interface TagConfig {
                attributeOverride: {
                    [key: string]: any;
                };
            }

            export class Tag {
                public tagName: string;
                public attributes: Object & BaseTypes.TextAttributes;
                public isSelfClosing: boolean;
                private _children: (Tag | TextTag)[];
                public config: Partial<TagConfig> = {};

                public readonly type = 'TAG';

                constructor({
                    tagName,
                    attributes,
                    isSelfClosing,
                    children,
                }: {
                    tagName: string;
                    attributes: BaseTypes.TextAttributes;
                    isSelfClosing: boolean;
                    children: (Tag | TextTag)[];
                }) {
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

                setChildren(children: (Tag | TextTag)[]) {
                    this._children = children;
                    return this;
                }

                walk(
                    handler: (
                        tag: Tag
                    ) => {
                        newTag: ParsedTag;
                        stop: boolean;
                    } | void
                ): ParsedTag {
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
                        .setChildren(
                            newTag.children.map((c) => c.walk(handler))
                        );
                }

                walkAll(
                    handler: <T extends Tag | TextTag>(tag: T) => T | void
                ): ParsedTag {
                    const result = handler(this);

                    /* istanbul ignore next */
                    const newTag = result || this;

                    return newTag
                        .copy()
                        .setChildren(
                            newTag.children.map((c) => c.walkAll(handler))
                        );
                }

                toText(): string {
                    if (this.isSelfClosing && this.children.length === 0) {
                        return `<${this.tagName}${_Attributes.stringify(
                            this.attributes
                        )}/>`;
                    }
                    return `<${this.tagName}${_Attributes.stringify(
                        this.attributes
                    )}>${this._children.map((c) => c.toText()).join('')}</${
                        this.tagName
                    }>`;
                }
            }

            export class TextTag {
                public content: string;

                public readonly type = 'TEXT';

                constructor({ content }: { content: string }) {
                    this.content = content;
                }

                walk() {
                    return this;
                }

                walkAll(
                    handler: <T extends Tag | TextTag>(tag: T) => T | void
                ): ParsedTag {
                    return handler(this) || this;
                }

                toText() {
                    return this.content;
                }
            }

            export type ParsedTag = Tag | TextTag;

            export namespace _Parser {
                export const _VOID_TAGS = [
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

                export function _getDOM(text: string) {
                    const handler = new DomHandler();
                    const parser = new HTMLParser(handler);

                    parser.write(text);
                    parser.end();

                    return handler.dom;
                }

                export interface _TagConfig {
                    textBase?: typeof TextTag;
                    tagBase?: typeof Tag;
                }

                export function _domToTags<
                    T extends Tag = Tag,
                    TT extends TextTag = TextTag
                >(
                    dom: (DataNode | Element)[],
                    { tagBase = Tag, textBase = TextTag }: _TagConfig = {}
                ): (T | TT)[] {
                    return dom.map((node) => {
                        if (node.type === 'text') {
                            const dataNode = node as DataNode;
                            return new textBase({
                                content: dataNode.nodeValue,
                            }) as TT;
                        } else {
                            const tagNode = node as Element;
                            return new tagBase({
                                attributes: tagNode.attribs,
                                children: _domToTags(
                                    tagNode.children as (DataNode | Element)[],
                                    { tagBase, textBase }
                                ),
                                isSelfClosing: _VOID_TAGS.includes(
                                    tagNode.tagName.toLowerCase()
                                ),
                                tagName: tagNode.tagName,
                            }) as T;
                        }
                    });
                }

                export function parse<
                    T extends Tag = Tag,
                    TT extends TextTag = TextTag
                >(text: string, tagConfig?: _TagConfig): (T | TT)[] {
                    const dom = _getDOM(text);
                    return _domToTags<T, TT>(
                        dom as (DataNode | Element)[],
                        tagConfig
                    );
                }
            }

            export namespace Replacement {
                export namespace Slots {
                    export interface SlotReceivers {
                        named: BaseTypes.StringMap<Tag>;
                        unnamed: Tag | null;
                    }

                    export interface Slottables {
                        named: BaseTypes.StringMap<Tag>;
                        unnamed: ParsedTag[];
                    }

                    export function findSlotReceivers(
                        root: ParsedTag[]
                    ): SlotReceivers {
                        const slots: SlotReceivers = {
                            named: {},
                            unnamed: null,
                        };
                        root.forEach((t) =>
                            t.walk((tag) => {
                                if (tag.tagName === 'slot') {
                                    if (tag.attributes.hasOwnProperty('name')) {
                                        const {
                                            name: slotName,
                                        } = tag.attributes;
                                        slots.named[slotName] =
                                            slots.named[slotName] || tag;
                                    } else {
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
                            })
                        );
                        return slots;
                    }

                    export function _findSlottables(
                        root: ParsedTag[]
                    ): Slottables {
                        const slottables: Slottables = {
                            named: {},
                            unnamed: [],
                        };

                        root.forEach((t) =>
                            t.walk((tag) => {
                                if (tag.attributes.hasOwnProperty('slot')) {
                                    const slotName = tag.attributes.slot;
                                    slottables.named[slotName] =
                                        slottables.named[slotName] || tag;
                                } else {
                                    slottables.unnamed.push(tag);
                                }
                                return {
                                    newTag: tag,
                                    stop: true,
                                };
                            })
                        );
                        return slottables;
                    }

                    export function _replaceSlots(
                        receivers: SlotReceivers,
                        slottables: Slottables
                    ) {
                        for (const slotName in slottables.named) {
                            const slottable = slottables.named[slotName];
                            if (receivers.named[slotName]) {
                                receivers.named[slotName].setChildren([
                                    slottable,
                                ]);
                            }
                        }

                        if (receivers.unnamed) {
                            receivers.unnamed.setChildren(slottables.unnamed);
                        }
                    }

                    export function applySlots(element: Tag, lightDOM: Tag) {
                        const receivers = findSlotReceivers(element.children);
                        const slottables = _findSlottables(lightDOM.children);
                        _replaceSlots(receivers, slottables);
                    }
                }

                export function _applyOverriddenAttributes(
                    tag: Tag,
                    markers: _ComplexRender._MarkerArr[]
                ) {
                    const overrides: BaseTypes.Attributes = {};
                    const attributes: BaseTypes.TextAttributes = {};

                    for (const attributeName in tag.attributes) {
                        const attributeValue = tag.attributes[attributeName];
                        if (
                            !_ComplexRender.markerHas(markers, attributeValue)
                        ) {
                            attributes[attributeName] = attributeValue;
                        } else {
                            overrides[attributeName] = _ComplexRender.markerGet(
                                markers,
                                attributeValue
                            );
                        }
                    }
                    return {
                        overrides,
                        attributes,
                    };
                }

                export function _mapTag(
                    tag: Tag,
                    session: DocumentSession,
                    markers: _ComplexRender._MarkerArr[]
                ): {
                    newTag: ParsedTag;
                    stop: boolean;
                } | void {
                    if (
                        !tag.tagName.includes('-') ||
                        !session._elementMap.hasOwnProperty(tag.tagName)
                    )
                        return;

                    const element = session._elementMap[tag.tagName];
                    const {
                        attributes,
                        overrides: props,
                    } = _applyOverriddenAttributes(tag, markers);
                    const newTag = elementToTag(
                        element,
                        props,
                        attributes,
                        session
                    );
                    Slots.applySlots(newTag, tag);
                    return {
                        newTag,
                        stop: true,
                    };
                }

                export function replace(
                    tags: ParsedTag[],
                    session: DocumentSession,
                    markers: _ComplexRender._MarkerArr[]
                ) {
                    return tags.map((t) =>
                        t.walk((tag) => {
                            return _mapTag(tag, session, markers);
                        })
                    );
                }
            }

            export namespace _CSS {
                export class CSSTag extends TextToTags.Tag {
                    public _changeOn!: CHANGE_TYPE;
                    private _cssChildren: CSSText[];

                    constructor({
                        tagName,
                        attributes,
                        isSelfClosing,
                        children,
                    }: {
                        tagName: string;
                        attributes: BaseTypes.TextAttributes;
                        isSelfClosing: boolean;
                        children: (Tag | TextTag | CSSText | CSSTag)[];
                    }) {
                        super({ tagName, attributes, isSelfClosing, children });
                        this._cssChildren = children as CSSText[];
                    }

                    get children() {
                        return this._cssChildren;
                    }

                    get elementGlobal() {
                        return (
                            this._changeOn === CHANGE_TYPE.THEME ||
                            !!(this._changeOn & CHANGE_TYPE.NEVER)
                        );
                    }

                    setChangeOn(changeOn: CHANGE_TYPE) {
                        this.children.forEach((c) => c.setChangeOn(changeOn));
                        this._changeOn = changeOn;
                    }
                }

                export interface ParsedCSS {
                    elementGlobal: boolean;
                    css: Stylesheet;
                }

                export class CSSText extends TextToTags.TextTag {
                    public _changeOn!: CHANGE_TYPE;
                    private _stylesheet: null | Stylesheet = null;

                    constructor({ content }: { content: string }) {
                        super({ content });
                        this.content = content;
                    }

                    setChangeOn(changeOn: CHANGE_TYPE) {
                        this._changeOn = changeOn;
                    }

                    parse() {
                        try {
                            return parseCSS(this.content);
                        } catch (e) {
                            Errors._cssParseError(e, this.content);
                        }
                    }

                    get cssParsed() {
                        if (this._stylesheet) return this._stylesheet;
                        return (this._stylesheet = this.parse());
                    }

                    get stylesheet() {
                        return this.cssParsed.stylesheet;
                    }

                    addPrefix(prefix: string) {
                        /* istanbul ignore next */
                        if (!this.stylesheet) return;
                        this.stylesheet.rules = this.stylesheet.rules.map(
                            (line) => {
                                /* istanbul ignore next */
                                if (!('selectors' in line)) return line;
                                const rule = line as Rule;
                                /* istanbul ignore next */
                                if (!rule.selectors) return line;
                                rule.selectors = rule.selectors.map(
                                    (selector) => {
                                        return `${prefix}-${selector}`;
                                    }
                                );
                                return rule;
                            }
                        );
                    }

                    stringify() {
                        this.content = stringifyCSS(this.cssParsed);
                    }
                }

                export function _parseElementCSS(
                    element: BaseTypes.BaseClass,
                    instance: BaseTypes.BaseClassInstance
                ): CSSTag[][] {
                    /* istanbul ignore next */
                    if (!element.css) return [];
                    const templates = Array.isArray(element.css)
                        ? element.css
                        : [element.css];

                    return templates.map((template) => {
                        const text = _tryRender(() => {
                            return (
                                /* istanbul ignore next */
                                template?.renderAsText(
                                    CHANGE_TYPE.ALWAYS,
                                    instance
                                ) || ''
                            );
                        });
                        const cssTags = TextToTags._Parser.parse<
                            CSSTag,
                            CSSText
                        >(text, {
                            tagBase: CSSTag,
                            textBase: CSSText,
                        });
                        const styleTags = cssTags.filter((t): t is CSSTag => {
                            return t.type === 'TAG';
                        });
                        styleTags.forEach((t) =>
                            t.setChangeOn(template.changeOn)
                        );
                        return styleTags;
                    });
                }

                export function _generateUniqueID(
                    element: BaseTypes.BaseClass,
                    tagName: string,
                    session: DocumentSession
                ) {
                    if (!session._cssIdentifierMap.has(element)) {
                        session._cssIdentifierMap.set(element, 0);
                    }

                    const num = session._cssIdentifierMap.get(element)!;
                    session._cssIdentifierMap.set(element, num + 1);

                    return `css-${tagName}-${num}`;
                }

                export function _generateComponentID(tagName: string) {
                    return `css-${tagName}`;
                }

                export function _addCSSPrefixes(
                    templates: CSSTag[][],
                    uniqueID: string,
                    componentID: string
                ) {
                    return templates.map((template) => {
                        return template.map((sheet) => {
                            const prefix = sheet.elementGlobal
                                ? componentID
                                : uniqueID;

                            sheet.children.map((tag) => {
                                tag.addPrefix(prefix);
                                tag.stringify();
                            });
                            return sheet;
                        });
                    });
                }

                export function _addHTMLPrefixes(
                    tags: ParsedTag[],
                    uniqueID: string,
                    componentID: string
                ) {
                    return tags.map((tagClass) => {
                        return tagClass.walk((tag) => {
                            const classNames = (() => {
                                if (!tag.attributes.hasOwnProperty('class'))
                                    return [];
                                const classNames = tag.attributes
                                    .class as string;
                                return classNames.split(' ');
                            })();
                            classNames.push(uniqueID, componentID);
                            tag.attributes.class = classNames.join(' ');

                            return {
                                newTag: tag,
                                stop: tag.tagName.includes('-'),
                            };
                        });
                    });
                }

                export function _flatten<V>(values: (V | V[])[]): V[] {
                    const result: V[] = [];
                    for (const arr of values) {
                        if (Array.isArray(arr)) {
                            result.push(...arr);
                        } else {
                            result.push(arr);
                        }
                    }
                    return result;
                }

                export function getCSSApplied(
                    element: BaseTypes.BaseClass,
                    instance: BaseTypes.BaseClassInstance,
                    tagName: string,
                    children: ParsedTag[],
                    session: DocumentSession
                ) {
                    const uniqueID = _generateUniqueID(
                        element,
                        tagName,
                        session
                    );
                    const componentID = _generateComponentID(tagName);

                    const parsed = _parseElementCSS(element, instance);
                    const prefixedCSS = _flatten(
                        _addCSSPrefixes(parsed, uniqueID, componentID)
                    );

                    const htmlPrefixed = _addHTMLPrefixes(
                        children,
                        uniqueID,
                        componentID
                    );

                    const isFirstElementRender = !session._sheetSet.has(
                        element
                    );
                    session._sheetSet.add(element);

                    return [
                        ...(isFirstElementRender
                            ? _flatten(
                                  prefixedCSS.filter((s) => s.elementGlobal)
                              )
                            : []),
                        ..._flatten(
                            prefixedCSS.filter((s) => !s.elementGlobal)
                        ),
                        ...htmlPrefixed,
                    ];
                }
            }

            export function _tryRender<R>(renderFunction: () => R): R {
                try {
                    return renderFunction();
                } catch (e) {
                    Errors._renderError(e);
                }
            }

            export namespace _ComplexRender {
                export interface _RenderedTemplate {
                    strings: TemplateStringsArray | string[];
                    values: any[];
                }

                export type _MarkerMeta = (
                    | {
                          isTag: true;
                          attrName: string;
                      }
                    | {
                          isTag?: false;
                          attrName?: undefined;
                      }
                ) & {
                    forceMarker?: boolean;
                };

                export type _MarkerArr = [string, any, _MarkerMeta];

                export let _markedIndex: number = 0;
                export function _templateToMarkedString({
                    strings,
                    values,
                }: _RenderedTemplate) {
                    const markers: _MarkerArr[] = [];

                    const result: string[] = [strings[0]];
                    for (let i = 0; i < values.length; i++) {
                        const marker = `___marker${_markedIndex++}___`;
                        result.push(marker, strings[i + 1]);
                        markers.push([marker, values[i], {}]);
                    }
                    return {
                        text: result.join(''),
                        markers,
                    };
                }

                export function _getPreAttrRemoved(
                    resultStrings: string[],
                    config: _MarkerArr[2]
                ) {
                    let sliceChars = config.attrName!.length + 1;
                    if (
                        resultStrings[resultStrings.length - 1].endsWith('"') ||
                        resultStrings[resultStrings.length - 1].endsWith("'")
                    ) {
                        // Quoted
                        sliceChars++;
                    }
                    return resultStrings[resultStrings.length - 1].slice(
                        0,
                        -sliceChars
                    );
                }

                export function _ensurePostQuote(str: string) {
                    const nextChar = str[0];
                    if (nextChar !== '"') {
                        if (nextChar === "'") {
                            // Replace with "
                            return `"${str.slice(1)}`;
                        } else {
                            // No quote, add a quote
                            return `"${str}`;
                        }
                    }
                    return str;
                }

                export function _ensureNoPostQuote(str: string) {
                    const nextChar = str[0];
                    if (nextChar === '"' || nextChar === "'") {
                        return str.slice(1);
                    }
                    return str;
                }

                export function _finalMarkedToString(
                    strings: string[],
                    markers: _MarkerArr[]
                ): string {
                    const result: string[] = [strings[0]];
                    for (let i = 0; i < strings.length - 1; i++) {
                        const [marker, value, config] = markers[i];
                        if (config.isTag && config.attrName.startsWith('?')) {
                            result[result.length - 1] = _getPreAttrRemoved(
                                result,
                                config
                            );
                            if (value) {
                                result.push(`${config.attrName.slice(1)}="`);
                                result.push(_ensurePostQuote(strings[i + 1]));
                            } else {
                                result.push(_ensureNoPostQuote(strings[i + 1]));
                            }
                        } else if (config.forceMarker) {
                            result.push(marker, strings[i + 1]);
                        } else if (
                            config.isTag &&
                            !_Attributes._isPrimitive(value)
                        ) {
                            // Delete it altogether
                            result[result.length - 1] = _getPreAttrRemoved(
                                result,
                                config
                            );
                            result.push(_ensureNoPostQuote(strings[i + 1]));
                        } else {
                            result.push(value, strings[i + 1]);
                        }
                    }
                    return result.join('');
                }

                export function _complexContentToString(
                    content: any
                ): {
                    isComplex: boolean;
                    str?: string;
                    markers: _MarkerArr[];
                } {
                    if (!_Attributes._isPrimitive(content)) {
                        if (Array.isArray(content)) {
                            const mappedContent = content.map((v) => {
                                const {
                                    isComplex,
                                    str,
                                    markers,
                                } = _complexContentToString(v);
                                if (isComplex)
                                    return {
                                        str,
                                        markers,
                                    };
                                return {
                                    str: v,
                                    markers: [],
                                };
                            });
                            const joinedStrings = mappedContent
                                .map((c) => c.str)
                                .join('');
                            const joinedMarkers = mappedContent.reduce(
                                (prev, current) => {
                                    return [...prev, ...current.markers];
                                },
                                []
                            );
                            return {
                                isComplex: true,
                                str: joinedStrings,
                                markers: joinedMarkers,
                            };
                        }
                        if ('values' in content && 'strings' in content) {
                            const { markers, str } = _complexRenderedToText(
                                content
                            );
                            return {
                                isComplex: true,
                                str,
                                markers,
                            };
                        }
                    }
                    return { isComplex: false, markers: [] };
                }

                export function markerHas(markers: _MarkerArr[], value: any) {
                    for (const [marker] of markers) {
                        if (marker === value) return true;
                    }
                    return false;
                }

                export function markerGet(markers: _MarkerArr[], value: any) {
                    for (const [marker, markerValue] of markers) {
                        if (marker === value) return markerValue;
                    }
                }

                export function _markerSet(
                    markers: _MarkerArr[],
                    keyMarker: string,
                    value: any,
                    config?: _MarkerMeta
                ) {
                    for (let i = 0; i < markers.length; i++) {
                        const [marker] = markers[i];
                        if (marker === keyMarker) {
                            markers[i][1] = value;
                            if (config) {
                                markers[i][2] = {
                                    ...markers[i][2],
                                    ...config,
                                } as _MarkerMeta;
                            }
                            return;
                        }
                    }
                }

                export function _applyComplexToTag(
                    tag: Tag | TextTag,
                    markers: _MarkerArr[]
                ) {
                    if (tag.type === 'TEXT') {
                        const markerKey = tag.content.trim();
                        if (!markerHas(markers, markerKey)) {
                            return;
                        }

                        const marked = markerGet(markers, markerKey);
                        // Check if there is an object-like in the DOM
                        const {
                            isComplex,
                            str,
                            markers: contentMarkers,
                        } = _complexContentToString(marked);
                        markers.push(...(contentMarkers || []));

                        if (isComplex) {
                            _markerSet(markers, markerKey, str!);
                        }
                    } else {
                        const attrValues = { ...tag.attributes };
                        for (const attrName in tag.attributes) {
                            const attrValue = tag.attributes[attrName];
                            if (!markerHas(markers, attrValue)) continue;

                            const marked = markerGet(markers, attrValue);

                            if (attrName === 'class') {
                                const classString = classNames(marked);
                                attrValues[attrName] = classString;
                                _markerSet(markers, attrValue, classString);
                            } else {
                                _markerSet(markers, attrValue, marked, {
                                    isTag: true,
                                    attrName,
                                });
                            }
                        }
                        if (tag.tagName.includes('-')) {
                            // Output markers and resolve to map
                            for (const attrName in tag.attributes) {
                                const attrValue = tag.attributes[attrName];

                                if (!markerHas(markers, attrValue)) continue;

                                _markerSet(
                                    markers,
                                    attrValue,
                                    markerGet(markers, attrValue),
                                    {
                                        forceMarker: true,
                                    }
                                );
                            }

                            tag.config.attributeOverride = attrValues;
                        }
                    }
                }

                export function _complexRenderedToText(
                    renderedTemplate: any
                ): {
                    str: string;
                    markers: _MarkerArr[];
                } {
                    // Render to text with markers inserted
                    const textRenderedMarked = _templateToMarkedString(
                        renderedTemplate
                    );

                    // Check if values at those markers contain anything special
                    const parsedMarked = _Parser.parse(textRenderedMarked.text);
                    for (const parsedTag of parsedMarked) {
                        parsedTag.walkAll((tag) => {
                            _applyComplexToTag(tag, textRenderedMarked.markers);
                        });
                    }

                    // Convert the old template to text again with new values
                    return {
                        str: _finalMarkedToString(
                            renderedTemplate.strings,
                            textRenderedMarked.markers
                        ),
                        markers: textRenderedMarked.markers,
                    };
                }

                export function renderToText(
                    instance: BaseTypes.BaseClassInstance,
                    template: TemplateFnLike<number> | null
                ): {
                    str: string;
                    markers: _MarkerArr[];
                } {
                    /* istanbul ignore next */
                    if (!template)
                        return {
                            str: '',
                            markers: [],
                        };
                    const renderedTemplate = _tryRender(() => {
                        return template.renderTemplate(
                            CHANGE_TYPE.ALWAYS,
                            instance
                        );
                    });
                    if (
                        typeof renderedTemplate !== 'object' ||
                        !('values' in renderedTemplate) ||
                        !('strings' in renderedTemplate)
                    ) {
                        return {
                            str: template.renderAsText(
                                CHANGE_TYPE.ALWAYS,
                                instance
                            ),
                            markers: [],
                        };
                    }

                    return _complexRenderedToText(renderedTemplate);
                }
            }

            export function elementToTag(
                element: BaseTypes.BaseClass,
                props: BaseTypes.Props,
                attribs: BaseTypes.Attributes,
                session: DocumentSession,
                isRoot: boolean = false
            ): Tag {
                const tagName =
                    element.is ||
                    `wclib-element${session._unnamedElements.amount++}`;
                const wrappedClass = BaseTypes._createBase(
                    element,
                    tagName,
                    props,
                    attribs,
                    session
                );
                const instance = new wrappedClass();

                const { str, markers } = _ComplexRender.renderToText(
                    instance,
                    element.html
                );
                const tags = _Parser.parse(str);
                if (
                    isRoot &&
                    _Rendering.TextToTags.Replacement.Slots.findSlotReceivers(
                        tags
                    ).unnamed
                ) {
                    throw new Error(
                        "Root element can't have unnamed slots as children"
                    );
                }
                const { attributes, publicProps } = _Properties.splitAttributes(
                    instance,
                    {
                        ...props,
                        ...attribs,
                    }
                );
                const children = Replacement.replace(tags, session, markers);
                const cssApplied = _CSS.getCSSApplied(
                    element,
                    instance,
                    tagName,
                    children,
                    session
                );
                return new Tag({
                    tagName,
                    attributes: {
                        ...attributes,
                        ...publicProps,
                        ...instance._attributes,
                    },
                    isSelfClosing: false,
                    children: cssApplied,
                });
            }
        }

        export function render<C extends BaseTypes.BaseClass>(
            element: C,
            props: BaseTypes.Props,
            attributes: BaseTypes.Attributes,
            session: DocumentSession
        ): string {
            const dom = TextToTags.elementToTag(
                element,
                props,
                attributes,
                session,
                true
            );
            return dom.toText();
        }
    }

    export function renderElement<
        C extends BaseTypes.BaseClass,
        I extends InferInstance<C>
    >(
        element: C,
        {
            attributes,
            documentSession = new DocumentSession(),
            i18n,
            props,
            theme,
            getMessage,
        }: SSRConfig<C, I>
    ): string {
        documentSession._elementMap = {
            ...documentSession._elementMap,
            ..._Rendering.Dependencies.buildMap(element),
        };
        const session = documentSession
            .clone()
            .mergeConfig({ i18n, theme, getMessage });

        return _Rendering.render(
            element,
            props || {},
            attributes || {},
            session
        );
    }
}

/**
 * The base class that can be rendered using server side rendering
 */
export interface SSRBaseClass extends SSR.BaseTypes.BaseClass {}

export interface SSRConfig<
    C extends SSR.BaseTypes.BaseClass,
    I extends InferInstance<C>
> {
    props?: Partial<I['props']>;
    attributes?: SSR.BaseTypes.Attributes;
    theme?: SSR.BaseTypes.Theme;
    i18n?: any;
    documentSession?: SSR.DocumentSession;
    getMessage?: SSR.GetMessageFunction;
}

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
 * @param { any } [config.i18n] - The i8n to apply to the element
 * @param { SSR.GetMessageFunction } [config.getMessage] - The
 *  function called when an i18n message is fetched
 * @param {SSR.DocumentSession} [config.documentSession] - The document session to use (remembers theme and i18n)
 *
 * @returns {string} The rendered element
 */
export function ssr<
    C extends SSR.BaseTypes.BaseClass,
    I extends InferInstance<C>
>(element: C, config: SSRConfig<C, I> = {}): string {
    return SSR.renderElement(element, config);
}

/**
 * Create a document rendering session. Pass the returned document to `ssr` to
 *  preserve the state of the document, avoiding conflicts
 *
 * @returns {SSR.DocumentSession} A document rendering session's variables
 */
export function createSSRSession(
    config: SSR.DocumentConfig = {}
): SSR.DocumentSession {
    return new SSR.DocumentSession(config);
}
