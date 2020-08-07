import {
    parse as parseCSS,
    Stylesheet,
    stringify as stringifyCSS,
    Rule,
    StyleRules,
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
import { ComplexValue, StyleAttributePart } from '../template-manager';
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
        i18n?: any;
        lang?: string;
        themeName?: string;
        theme?: SSR.BaseTypes.Theme;
        getMessage?: GetMessageFunction;
    }

    interface PaddedDocumentConfig extends DocumentConfig {
        doWait?: boolean;
    }

    export class DocumentSession {
        _i18n?: any;
        _lang?: string;
        _theme?: SSR.BaseTypes.Theme;
        _themeName?: string;
        _getMessage?: GetMessageFunction;
        _doWait?: boolean;

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

        constructor({
            i18n,
            theme,
            getMessage,
            lang,
            themeName,
            doWait,
        }: PaddedDocumentConfig = {}) {
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
        mergeConfig({
            i18n,
            theme,
            getMessage,
            lang,
            themeName,
            doWait,
        }: PaddedDocumentConfig) {
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
                    /* istanbul ignore next */
                    if (refMap.has(name)) {
                        return refMap.get(name);
                    }

                    const ref =
                        'genRef' in this && this.genRef
                            ? this.genRef(value)
                            : /* istanbul ignore next */
                              String(value);

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
                getThemeName() {
                    return session._themeName;
                }
                getLang() {
                    return session._lang;
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

        export function _casingToDashes(name: string) {
            return name
                .replace(/([a-z\d])([A-Z])/g, '$1-$2')
                .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1-$2')
                .toLowerCase();
        }

        export function stringify(attributes: BaseTypes.Attributes) {
            if (Object.keys(attributes).length === 0) {
                return '';
            }

            const parts = [];
            for (const key in attributes) {
                if (!/^[a-z].*/.test(key)) continue;
                parts.push(
                    `${_casingToDashes(key)}="${_toString(
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
                    attribs[key] = attributes[key];
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
        export namespace _Util {
            export async function mapAsyncInOrder<I, R>(
                arr: I[],
                handler: (item: I) => Promise<R>
            ): Promise<R[]> {
                const results: R[] = [];
                for (const item of arr) {
                    results.push(await handler(item));
                }
                return results;
            }
        }

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
                private _slotted: boolean = false;

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

                get slotted() {
                    return this._slotted;
                }

                setSlotChildren(children: (Tag | TextTag)[]) {
                    this._slotted = true;
                    return this.setChildren(children);
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

                async walkBottomUp(
                    handler: (tag: Tag) => Promise<ParsedTag | void>
                ): Promise<ParsedTag> {
                    this.setChildren(
                        await _Util.mapAsyncInOrder(this.children, (child) =>
                            child.walkBottomUp(handler)
                        )
                    );

                    return (await handler(this)) || this;
                }

                async walkAll(
                    handler: <T extends Tag | TextTag>(
                        tag: T
                    ) => Promise<T | void>
                ): Promise<ParsedTag> {
                    const result = await handler(this);

                    /* istanbul ignore next */
                    const newTag = result || this;

                    return newTag
                        .copy()
                        .setChildren(
                            await _Util.mapAsyncInOrder(
                                newTag.children,
                                (child) => child.walkAll(handler)
                            )
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

                async walkBottomUp() {
                    return this;
                }

                async walkAll(
                    handler: <T extends Tag | TextTag>(
                        tag: T
                    ) => Promise<T | void>
                ): Promise<ParsedTag> {
                    return (await handler(this)) || this;
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
                    return dom
                        .map((node) => {
                            if (node.type === 'text') {
                                const dataNode = node as DataNode;
                                return new textBase({
                                    content: dataNode.nodeValue,
                                }) as TT;
                            } else if (
                                node.type === 'tag' ||
                                node.type === 'style' ||
                                node.type === 'script'
                            ) {
                                const tagNode = node as Element;
                                return new tagBase({
                                    attributes: tagNode.attribs,
                                    children: _domToTags(
                                        tagNode.children as (
                                            | DataNode
                                            | Element
                                        )[],
                                        { tagBase, textBase }
                                    ),
                                    isSelfClosing: _VOID_TAGS.includes(
                                        tagNode.tagName.toLowerCase()
                                    ),
                                    tagName: tagNode.tagName,
                                }) as T;
                            }
                            return undefined;
                        })
                        .filter((v) => !!v) as (T | TT)[];
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
                                    if (tag.slotted) {
                                        return { newTag: tag, stop: true };
                                    }
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
                            receivers.unnamed.setSlotChildren(
                                slottables.unnamed
                            );
                        }
                    }

                    export function applySlots(element: Tag, lightDOM: Tag) {
                        const receivers = findSlotReceivers(element.children);
                        const slottables = _findSlottables(lightDOM.children);
                        _replaceSlots(receivers, slottables);
                    }
                }

                export async function _applyOverriddenAttributes(
                    tag: Tag,
                    markers: _ComplexRender._MarkerArr[],
                    session: DocumentSession
                ) {
                    const overrides: BaseTypes.Attributes = {};
                    const attributes: BaseTypes.TextAttributes = {};

                    for (const attributeName in tag.attributes) {
                        const attributeValue = tag.attributes[attributeName];
                        if (
                            !(await _ComplexRender.markerHas(
                                markers,
                                attributeValue
                            ))
                        ) {
                            attributes[attributeName] = attributeValue;
                        } else {
                            overrides[
                                attributeName
                            ] = await _ComplexRender.markerGetValue(
                                markers,
                                attributeValue,
                                session._doWait || false
                            );
                        }
                    }
                    return {
                        overrides,
                        attributes,
                    };
                }

                export async function _mapTag(
                    tag: Tag,
                    session: DocumentSession,
                    markers: _ComplexRender._MarkerArr[]
                ): Promise<ParsedTag | void> {
                    if (
                        !tag.tagName.includes('-') ||
                        !session._elementMap.hasOwnProperty(tag.tagName)
                    )
                        return;

                    const element = session._elementMap[tag.tagName];
                    const {
                        attributes,
                        overrides: props,
                    } = await _applyOverriddenAttributes(tag, markers, session);
                    const newTag = await elementToTag(
                        element,
                        props,
                        attributes,
                        session
                    );
                    Slots.applySlots(newTag, tag);
                    return newTag;
                }

                export async function replace(
                    tags: ParsedTag[],
                    session: DocumentSession,
                    markers: _ComplexRender._MarkerArr[]
                ) {
                    return await _Util.mapAsyncInOrder(tags, (t) =>
                        t.walkBottomUp((tag) => {
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

                    parse(): any {
                        try {
                            return parseCSS(this.content);
                        } catch (e) {
                            Errors._cssParseError(e, this.content);
                        }
                    }

                    get cssParsed(): any {
                        if (this._stylesheet) return this._stylesheet;
                        return (this._stylesheet = this.parse());
                    }

                    get stylesheet(): any {
                        return this.cssParsed.stylesheet;
                    }

                    addPrefix(prefix: string) {
                        /* istanbul ignore next */
                        if (!this.stylesheet) return;
                        const stylesheet = this.stylesheet as StyleRules;
                        stylesheet.rules = stylesheet.rules.map((line) => {
                            /* istanbul ignore next */
                            if (!('selectors' in line)) return line;
                            const rule = line as Rule;
                            /* istanbul ignore next */
                            if (!rule.selectors) return line;
                            rule.selectors = rule.selectors.map((selector) => {
                                return selector
                                    .split(' ')
                                    .map((part) => part.trim())
                                    .filter((v) => v.length)
                                    .map((rulePart) => {
                                        if (rulePart === '*')
                                            return `.${prefix}`;
                                        if (
                                            rulePart.length === 1 &&
                                            !/[a-z|A-Z]/.test(rulePart)
                                        )
                                            return rulePart;

                                        if (rulePart.includes(':')) {
                                            const pseudo = rulePart.includes(
                                                '::'
                                            )
                                                ? '::'
                                                : ':';
                                            const [
                                                prePseudo,
                                                pseudoSelector,
                                            ] = rulePart.split(pseudo);
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

                export function _parseElementCSS(
                    element: BaseTypes.BaseClass,
                    instance: BaseTypes.BaseClassInstance
                ): Tag[][] {
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
                        return styleTags.map(
                            (styleTag) =>
                                new Tag({
                                    attributes: {
                                        'data-type': 'css',
                                    },
                                    children: [styleTag],
                                    isSelfClosing: false,
                                    tagName: 'span',
                                })
                        );
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
                    templates: Tag[][],
                    uniqueID: string,
                    componentID: string
                ) {
                    return templates.map((templateWrappers) => {
                        return templateWrappers.map((templateWrapper) => {
                            const sheet = templateWrapper.children[0] as CSSTag;
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

                export function _addHTMLPrefixes(
                    tags: ParsedTag[],
                    uniqueID: string,
                    componentID: string
                ) {
                    return tags.map((tagClass) => {
                        return tagClass.walk((tag) => {
                            const classNames = (() => {
                                if (!tag.attributes['class']) return [];
                                const classNames = tag.attributes
                                    .class as string;
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
                                  prefixedCSS.filter(
                                      (s) =>
                                          (s.children[0] as CSSTag)
                                              .elementGlobal
                                  )
                              )
                            : []),
                        ..._flatten(
                            prefixedCSS.filter(
                                (s) => !(s.children[0] as CSSTag).elementGlobal
                            )
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

                export async function _finalMarkedToString(
                    strings: string[],
                    markers: _MarkerArr[],
                    session: DocumentSession
                ): Promise<string> {
                    const result: string[] = [strings[0]];
                    for (let i = 0; i < strings.length - 1; i++) {
                        const [marker, value, config] = markers[i];
                        const evaluatedValue = session._doWait
                            ? await value
                            : value;
                        if (config.isTag && config.attrName.startsWith('?')) {
                            result[result.length - 1] = _getPreAttrRemoved(
                                result,
                                config
                            );
                            if (evaluatedValue) {
                                result.push(`${config.attrName.slice(1)}="`);
                                result.push(_ensurePostQuote(strings[i + 1]));
                            } else {
                                result.push(_ensureNoPostQuote(strings[i + 1]));
                            }
                        } else if (config.forceMarker) {
                            result.push(marker, strings[i + 1]);
                        } else if (
                            config.isTag &&
                            !_Attributes._isPrimitive(evaluatedValue)
                        ) {
                            // Delete it altogether
                            result[result.length - 1] = _getPreAttrRemoved(
                                result,
                                config
                            );
                            result.push(_ensureNoPostQuote(strings[i + 1]));
                        } else {
                            result.push(evaluatedValue, strings[i + 1]);
                        }
                    }
                    return result.join('');
                }

                export async function _complexContentToString(
                    content: any,
                    session: DocumentSession
                ): Promise<{
                    isComplex: boolean;
                    str?: string;
                    markers: _MarkerArr[];
                }> {
                    if (!_Attributes._isPrimitive(content)) {
                        if (Array.isArray(content)) {
                            const mappedContent = await _Util.mapAsyncInOrder(
                                content,
                                async (v) => {
                                    const {
                                        isComplex,
                                        str,
                                        markers,
                                    } = await _complexContentToString(
                                        v,
                                        session
                                    );
                                    if (isComplex)
                                        return {
                                            str,
                                            markers,
                                        };
                                    return {
                                        str: v,
                                        markers: [],
                                    };
                                }
                            );
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
                            const {
                                markers,
                                str,
                            } = await _complexRenderedToText(content, session);
                            return {
                                isComplex: true,
                                str,
                                markers,
                            };
                        }
                    }
                    return { isComplex: false, markers: [] };
                }

                export async function markerHas(
                    markers: _MarkerArr[],
                    value: any
                ) {
                    return (
                        (await markerGetAll(markers, value, false)).length > 0
                    );
                }

                export async function markerGetValue(
                    markers: _MarkerArr[],
                    value: string,
                    doWait: boolean
                ) {
                    const markerValue = markers
                        .filter(([marker]) => {
                            return value.includes(marker);
                        })
                        .map(([, markerValue]) => markerValue)[0];
                    if (doWait) {
                        return await markerValue;
                    }
                    return markerValue;
                }

                export async function markerGetAll(
                    markers: _MarkerArr[],
                    value: string,
                    doWait: boolean
                ) {
                    const values = markers.filter(([marker]) => {
                        return value.includes(marker);
                    });
                    if (doWait) {
                        return await Promise.all(
                            values.map(async ([key, value]) => [
                                key,
                                await value,
                            ])
                        );
                    }
                    return values;
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

                export async function _applyComplexToTag(
                    tag: Tag | TextTag,
                    markers: _MarkerArr[],
                    session: DocumentSession
                ) {
                    if (tag.type === 'TEXT') {
                        const value = tag.content.trim();
                        if (!(await markerHas(markers, value))) {
                            return;
                        }

                        const markedArr = await markerGetAll(
                            markers,
                            value,
                            session._doWait || false
                        );
                        // Check if there is an object-like in the DOM
                        await _Util.mapAsyncInOrder(
                            markedArr,
                            async ([markedKey, markedValue]) => {
                                const {
                                    isComplex,
                                    str,
                                    markers: contentMarkers,
                                } = await _complexContentToString(
                                    markedValue,
                                    session
                                );
                                markers.push(...contentMarkers);

                                if (isComplex) {
                                    _markerSet(markers, markedKey, str!);
                                }
                            }
                        );
                    } else {
                        const attrValues = { ...tag.attributes };
                        for (const attrName in tag.attributes) {
                            const attrValue = tag.attributes[attrName];
                            if (!(await markerHas(markers, attrValue)))
                                continue;

                            const marked = (
                                await markerGetAll(
                                    markers,
                                    attrValue,
                                    session._doWait || false
                                )
                            ).map(([, val]) => val);

                            if (attrName === 'class') {
                                const classString = classNames(marked);
                                attrValues[attrName] = classString;
                                _markerSet(markers, attrValue, classString);
                            } else if (attrName === 'style') {
                                const markedValue = marked[0];
                                const value = (() => {
                                    if (
                                        typeof markedValue === 'string' ||
                                        typeof markedValue === 'number'
                                    ) {
                                        return markedValue;
                                    }
                                    return StyleAttributePart.getStyleString(
                                        markedValue
                                    );
                                })();
                                attrValues[attrName] = value;
                                _markerSet(markers, attrValue, value);
                            } else {
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

                                if (!(await markerHas(markers, attrValue)))
                                    continue;

                                _markerSet(
                                    markers,
                                    attrValue,
                                    markerGetValue(
                                        markers,
                                        attrValue,
                                        session._doWait || false
                                    ),
                                    {
                                        forceMarker: true,
                                    }
                                );
                            }

                            tag.config.attributeOverride = attrValues;
                        }
                    }
                }

                export async function _complexRenderedToText(
                    renderedTemplate: any,
                    session: DocumentSession
                ): Promise<{
                    str: string;
                    markers: _MarkerArr[];
                }> {
                    // Render to text with markers inserted
                    const textRenderedMarked = _templateToMarkedString(
                        renderedTemplate
                    );

                    // Check if values at those markers contain anything special
                    const parsedMarked = _Parser.parse(textRenderedMarked.text);
                    for (const parsedTag of parsedMarked) {
                        await parsedTag.walkAll(async (tag) => {
                            await _applyComplexToTag(
                                tag,
                                textRenderedMarked.markers,
                                session
                            );
                        });
                    }

                    // Convert the old template to text again with new values
                    return {
                        str: await _finalMarkedToString(
                            renderedTemplate.strings,
                            textRenderedMarked.markers,
                            session
                        ),
                        markers: textRenderedMarked.markers,
                    };
                }

                export async function renderToText(
                    instance: BaseTypes.BaseClassInstance,
                    template: TemplateFnLike<number> | null,
                    session: DocumentSession
                ): Promise<{
                    str: string;
                    markers: _MarkerArr[];
                }> {
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

                    return await _complexRenderedToText(
                        renderedTemplate,
                        session
                    );
                }
            }

            export async function elementToTag(
                element: BaseTypes.BaseClass,
                props: BaseTypes.Props,
                attribs: BaseTypes.Attributes,
                session: DocumentSession,
                isRoot: boolean = false
            ): Promise<Tag> {
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

                const { str, markers } = await _ComplexRender.renderToText(
                    instance,
                    element.html,
                    session
                );
                const htmlTag = new Tag({
                    attributes: {
                        'data-type': 'html',
                    },
                    children: _Parser.parse(str),
                    isSelfClosing: false,
                    tagName: 'span',
                });
                if (
                    isRoot &&
                    _Rendering.TextToTags.Replacement.Slots.findSlotReceivers([
                        htmlTag,
                    ]).unnamed
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
                const cssApplied = _CSS.getCSSApplied(
                    element,
                    instance,
                    tagName,
                    [htmlTag],
                    session
                );
                const children = await Replacement.replace(
                    cssApplied,
                    session,
                    markers
                );

                return new Tag({
                    tagName,
                    attributes: {
                        ...attributes,
                        ...publicProps,
                        ...instance._attributes,
                    },
                    isSelfClosing: false,
                    children: children,
                });
            }
        }

        export async function render<C extends BaseTypes.BaseClass>(
            element: C,
            props: BaseTypes.Props,
            attributes: BaseTypes.Attributes,
            session: DocumentSession
        ): Promise<string> {
            const dom = await TextToTags.elementToTag(
                element,
                props,
                attributes,
                session,
                true
            );
            return dom.toText();
        }
    }
    export async function renderElement<
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
            lang,
            themeName,
            await: doWait = false,
        }: SSRConfig<C, I>
    ): Promise<string> {
        documentSession._elementMap = {
            ...documentSession._elementMap,
            ..._Rendering.Dependencies.buildMap(element),
        };
        const session = documentSession
            .clone()
            .mergeConfig({ i18n, theme, getMessage, lang, themeName, doWait });

        return await _Rendering.render(
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
    i18n?: any;
    lang?: string;
    themeName?: string;
    props?: Partial<I['props']>;
    theme?: SSR.BaseTypes.Theme;
    getMessage?: SSR.GetMessageFunction;
    documentSession?: SSR.DocumentSession;
    attributes?: SSR.BaseTypes.Attributes;
    await?: boolean;
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
export async function ssr<
    C extends SSR.BaseTypes.BaseClass,
    I extends InferInstance<C>
>(element: C, config: SSRConfig<C, I> = {}): Promise<string> {
    return await SSR.renderElement(element, config);
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
