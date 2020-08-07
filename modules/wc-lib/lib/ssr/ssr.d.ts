import { DataNode, Element } from 'domhandler';
import { WebComponentBaseTypeInstance, InferInstance, WebComponentTypeInstance, WebComponentBaseTypeStatic, WebComponentTypeStatic } from '../../classes/types';
import { CHANGE_TYPE, TemplateFnLike } from '../template-fn';
import { ComplexValue } from '../template-manager';
/**
 * The serverside rendering namespace that is used internally to do the whole
 * operation. The entire thing and its contents are exported but only the
 * "useful" exports are not prefixed with an underscore. This means you can
 * always access anything but can still distinguish between code that
 * should or should not be imported.
 */
export declare namespace SSR {
    export namespace Errors {
        class RenderError extends Error {
            source: Error;
            constructor(message: string, source: Error);
        }
        class CSSParseError extends Error {
            source: Error;
            file: string;
            constructor(message: string, source: Error, file: string);
        }
        function _renderError(e: Error): never;
        function _cssParseError(e: Error, file: string): never;
    }
    export class MergableWeakMap<K extends object, V> implements WeakMap<K, V> {
        private _maps;
        merge(map: MergableWeakMap<K, V>): this;
        delete(key: K): boolean;
        get(key: K): V | undefined;
        has(key: K): boolean;
        set(key: K, value: V): this;
        clone(): MergableWeakMap<K, V>;
        [Symbol.toStringTag]: string;
    }
    export class MergableWeakSet<T extends object> implements WeakSet<T> {
        private _sets;
        merge(set: MergableWeakSet<T>): this;
        delete(value: T): boolean;
        has(value: T): boolean;
        add(value: T): this;
        clone(): MergableWeakSet<T>;
        [Symbol.toStringTag]: string;
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
        _cssIdentifierMap: MergableWeakMap<BaseTypes.BaseClass, number>;
        _sheetSet: MergableWeakSet<BaseTypes.BaseClass>;
        _unnamedElements: {
            amount: number;
        };
        _elementMap: BaseTypes.DependencyMap;
        constructor({ i18n, theme, getMessage, lang, themeName, doWait, }?: PaddedDocumentConfig);
        /**
         * Merge a config into this SSR session, prioritizing config over current state
         */
        mergeConfig({ i18n, theme, getMessage, lang, themeName, doWait, }: PaddedDocumentConfig): this;
        /**
         * Merge a document session into this one, prioritizing the merged one
         *
         * @param {DocumentSession} session - The session to merge
         *
         * @returns {DocumentSession} The merged documentSession (this)
         */
        merge(session: DocumentSession): DocumentSession;
        /**
         * Clone this document session and preserve any object links.
         * Any changes to the clone **are** reflected to the original.
         *
         * @returns {DocumentSession} The clone
         */
        clone(): DocumentSession;
        /**
         * Merge given sessions into the first one, prioritizing later values
         * over the earlier ones.
         *
         * @param {DocumentSession} target - The target into which everything is merged
         * @param {DocumentSession[]} [sessions] - Sessions to merge into this one
         *
         * @returns {DocumentSession} The merged into documentSession (this)
         */
        static merge<T extends DocumentSession>(target: T, ...sessions: DocumentSession[]): T;
    }
    export namespace BaseTypes {
        interface BaseClassInstance extends WebComponentBaseTypeInstance, WebComponentTypeInstance {
            getTheme?(): Theme;
            genRef?(value: ComplexValue): string;
            getRef?(ref: string): ComplexValue;
        }
        type BaseClass = WebComponentBaseTypeStatic & WebComponentTypeStatic & {
            new (): BaseClassInstance;
            dependencies?: any[] | null;
            is?: string | null;
            html?: TemplateFnLike<number> | null;
            css?: TemplateFnLike<number> | TemplateFnLike<number>[] | null;
        };
        interface BaseClassInstanceExtended extends BaseClassInstance {
            _attributes: {
                [key: string]: string;
            };
            isSSR: boolean;
        }
        interface BaseClassExtended extends BaseClass {
            new (): BaseClassInstanceExtended;
        }
        type DependencyMap = Object & {
            [key: string]: BaseTypes.BaseClass;
        };
        type StringMap<V> = {
            [key: string]: V;
        };
        type Theme = StringMap<any>;
        type Props = Object & StringMap<any>;
        type Attributes = Object & StringMap<any>;
        type TextAttributes = Object & StringMap<any>;
        function _createBase<C extends {
            new (...args: any[]): {
                genRef?(value?: ComplexValue): string;
                getRef?(ref: string): ComplexValue;
            };
        }>(klass: C, tagName: string, props: BaseTypes.Props, attributes: BaseTypes.Attributes, session: DocumentSession): BaseClassExtended;
    }
    export namespace _Attributes {
        type Primitive = null | undefined | boolean | number | string | Symbol | bigint;
        function _isPrimitive(value: unknown): value is Primitive;
        function _isIterable(value: unknown): value is Iterable<unknown>;
        function _toString(value: any): string;
        function _casingToDashes(name: string): string;
        function stringify(attributes: BaseTypes.Attributes): string;
    }
    export namespace _Properties {
        function splitAttributes<A extends BaseTypes.Attributes>(element: BaseTypes.BaseClassInstance, attributes: A): {
            attributes: BaseTypes.Attributes;
            publicProps: BaseTypes.Attributes;
            privateProps: BaseTypes.Attributes;
        };
    }
    export namespace _Rendering {
        namespace _Util {
            function mapAsyncInOrder<I, R>(arr: I[], handler: (item: I) => Promise<R>): Promise<R[]>;
        }
        namespace Dependencies {
            function buildMap(element: BaseTypes.BaseClass, map?: BaseTypes.DependencyMap): BaseTypes.DependencyMap;
        }
        namespace TextToTags {
            interface TagConfig {
                attributeOverride: {
                    [key: string]: any;
                };
            }
            class Tag {
                tagName: string;
                attributes: Object & BaseTypes.TextAttributes;
                isSelfClosing: boolean;
                private _children;
                config: Partial<TagConfig>;
                private _slotted;
                readonly type = "TAG";
                constructor({ tagName, attributes, isSelfClosing, children, }: {
                    tagName: string;
                    attributes: BaseTypes.TextAttributes;
                    isSelfClosing: boolean;
                    children: (Tag | TextTag)[];
                });
                get children(): (Tag | TextTag)[];
                copy(): Tag;
                setChildren(children: (Tag | TextTag)[]): this;
                get slotted(): boolean;
                setSlotChildren(children: (Tag | TextTag)[]): this;
                walk(handler: (tag: Tag) => {
                    newTag: ParsedTag;
                    stop: boolean;
                } | void): ParsedTag;
                walkBottomUp(handler: (tag: Tag) => Promise<ParsedTag | void>): Promise<ParsedTag>;
                walkAll(handler: <T extends Tag | TextTag>(tag: T) => Promise<T | void>): Promise<ParsedTag>;
                toText(): string;
            }
            class TextTag {
                content: string;
                readonly type = "TEXT";
                constructor({ content }: {
                    content: string;
                });
                walk(): this;
                walkBottomUp(): Promise<this>;
                walkAll(handler: <T extends Tag | TextTag>(tag: T) => Promise<T | void>): Promise<ParsedTag>;
                toText(): string;
            }
            type ParsedTag = Tag | TextTag;
            namespace _Parser {
                const _VOID_TAGS: string[];
                function _getDOM(text: string): import("domhandler").Node[];
                interface _TagConfig {
                    textBase?: typeof TextTag;
                    tagBase?: typeof Tag;
                }
                function _domToTags<T extends Tag = Tag, TT extends TextTag = TextTag>(dom: (DataNode | Element)[], { tagBase, textBase }?: _TagConfig): (T | TT)[];
                function parse<T extends Tag = Tag, TT extends TextTag = TextTag>(text: string, tagConfig?: _TagConfig): (T | TT)[];
            }
            namespace Replacement {
                namespace Slots {
                    interface SlotReceivers {
                        named: BaseTypes.StringMap<Tag>;
                        unnamed: Tag | null;
                    }
                    interface Slottables {
                        named: BaseTypes.StringMap<Tag>;
                        unnamed: ParsedTag[];
                    }
                    function findSlotReceivers(root: ParsedTag[]): SlotReceivers;
                    function _findSlottables(root: ParsedTag[]): Slottables;
                    function _replaceSlots(receivers: SlotReceivers, slottables: Slottables): void;
                    function applySlots(element: Tag, lightDOM: Tag): void;
                }
                function _applyOverriddenAttributes(tag: Tag, markers: _ComplexRender._MarkerArr[], session: DocumentSession): Promise<{
                    overrides: BaseTypes.Props;
                    attributes: BaseTypes.Props;
                }>;
                function _mapTag(tag: Tag, session: DocumentSession, markers: _ComplexRender._MarkerArr[]): Promise<ParsedTag | void>;
                function replace(tags: ParsedTag[], session: DocumentSession, markers: _ComplexRender._MarkerArr[]): Promise<(Tag | TextTag)[]>;
            }
            namespace _CSS {
                class CSSTag extends TextToTags.Tag {
                    _changeOn: CHANGE_TYPE;
                    private _cssChildren;
                    constructor({ tagName, attributes, isSelfClosing, children, }: {
                        tagName: string;
                        attributes: BaseTypes.TextAttributes;
                        isSelfClosing: boolean;
                        children: (Tag | TextTag | CSSText | CSSTag)[];
                    });
                    get children(): CSSText[];
                    get elementGlobal(): boolean;
                    setChangeOn(changeOn: CHANGE_TYPE): void;
                }
                class CSSText extends TextToTags.TextTag {
                    _changeOn: CHANGE_TYPE;
                    private _stylesheet;
                    constructor({ content }: {
                        content: string;
                    });
                    setChangeOn(changeOn: CHANGE_TYPE): void;
                    parse(): any;
                    get cssParsed(): any;
                    get stylesheet(): any;
                    addPrefix(prefix: string): void;
                    stringify(): void;
                }
                function _parseElementCSS(element: BaseTypes.BaseClass, instance: BaseTypes.BaseClassInstance): Tag[][];
                function _generateUniqueID(element: BaseTypes.BaseClass, tagName: string, session: DocumentSession): string;
                function _generateComponentID(tagName: string): string;
                function _addCSSPrefixes(templates: Tag[][], uniqueID: string, componentID: string): Tag[][];
                function _addHTMLPrefixes(tags: ParsedTag[], uniqueID: string, componentID: string): (Tag | TextTag)[];
                function _flatten<V>(values: (V | V[])[]): V[];
                function getCSSApplied(element: BaseTypes.BaseClass, instance: BaseTypes.BaseClassInstance, tagName: string, children: ParsedTag[], session: DocumentSession): (Tag | TextTag)[];
            }
            function _tryRender<R>(renderFunction: () => R): R;
            namespace _ComplexRender {
                interface _RenderedTemplate {
                    strings: TemplateStringsArray | string[];
                    values: any[];
                }
                type _MarkerMeta = ({
                    isTag: true;
                    attrName: string;
                } | {
                    isTag?: false;
                    attrName?: undefined;
                }) & {
                    forceMarker?: boolean;
                };
                type _MarkerArr = [string, any, _MarkerMeta];
                let _markedIndex: number;
                function _templateToMarkedString({ strings, values, }: _RenderedTemplate): {
                    text: string;
                    markers: _MarkerArr[];
                };
                function _getPreAttrRemoved(resultStrings: string[], config: _MarkerArr[2]): string;
                function _ensurePostQuote(str: string): string;
                function _ensureNoPostQuote(str: string): string;
                function _finalMarkedToString(strings: string[], markers: _MarkerArr[], session: DocumentSession): Promise<string>;
                function _complexContentToString(content: any, session: DocumentSession): Promise<{
                    isComplex: boolean;
                    str?: string;
                    markers: _MarkerArr[];
                }>;
                function markerHas(markers: _MarkerArr[], value: any): Promise<boolean>;
                function markerGetValue(markers: _MarkerArr[], value: string, doWait: boolean): Promise<any>;
                function markerGetAll(markers: _MarkerArr[], value: string, doWait: boolean): Promise<any[][]>;
                function _markerSet(markers: _MarkerArr[], keyMarker: string, value: any, config?: _MarkerMeta): void;
                function _applyComplexToTag(tag: Tag | TextTag, markers: _MarkerArr[], session: DocumentSession): Promise<void>;
                function _complexRenderedToText(renderedTemplate: any, session: DocumentSession): Promise<{
                    str: string;
                    markers: _MarkerArr[];
                }>;
                function renderToText(instance: BaseTypes.BaseClassInstance, template: TemplateFnLike<number> | null, session: DocumentSession): Promise<{
                    str: string;
                    markers: _MarkerArr[];
                }>;
            }
            function elementToTag(element: BaseTypes.BaseClass, props: BaseTypes.Props, attribs: BaseTypes.Attributes, session: DocumentSession, isRoot?: boolean): Promise<Tag>;
        }
        function render<C extends BaseTypes.BaseClass>(element: C, props: BaseTypes.Props, attributes: BaseTypes.Attributes, session: DocumentSession): Promise<string>;
    }
    export function renderElement<C extends BaseTypes.BaseClass, I extends InferInstance<C>>(element: C, { attributes, documentSession, i18n, props, theme, getMessage, lang, themeName, await: doWait, }: SSRConfig<C, I>): Promise<string>;
    export {};
}
/**
 * The base class that can be rendered using server side rendering
 */
export interface SSRBaseClass extends SSR.BaseTypes.BaseClass {
}
export interface SSRConfig<C extends SSR.BaseTypes.BaseClass, I extends InferInstance<C>> {
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
export declare function ssr<C extends SSR.BaseTypes.BaseClass, I extends InferInstance<C>>(element: C, config?: SSRConfig<C, I>): Promise<string>;
/**
 * Create a document rendering session. Pass the returned document to `ssr` to
 *  preserve the state of the document, avoiding conflicts
 *
 * @returns {SSR.DocumentSession} A document rendering session's variables
 */
export declare function createSSRSession(config?: SSR.DocumentConfig): SSR.DocumentSession;
//# sourceMappingURL=ssr.d.ts.map