import { WebComponentBaseTypeInstance, WebComponentBaseTypeStatic, WebComponentTypeInstance, WebComponentTypeStatic } from '../classes/types';
import { Props, PropConfigObject } from '../lib/props';
declare const DEFAULT_VERSION = 1.1;
export interface BaseClassInstance extends WebComponentBaseTypeInstance, WebComponentTypeInstance {
}
export declare type BaseClass = WebComponentBaseTypeStatic & WebComponentTypeStatic & {
    new (): BaseClassInstance;
    dependencies?: {
        define(isDevelopment?: boolean, isRoot?: boolean): void;
    }[] | null;
    description?: string;
    is?: string | null;
};
export interface HTMLCustomData {
    version: typeof DEFAULT_VERSION;
    tags?: HTMLCustomData.Types.CustomDataTag[];
    globalAttributes?: HTMLCustomData.Types.Attribute[];
    valueSets?: HTMLCustomData.Types._ValueSet[];
}
export declare namespace HTMLCustomData {
    namespace Types {
        interface _MarkupDescription {
            kind: 'plaintext' | 'markdown';
            value: string;
        }
        interface _ValueSet {
            name: string;
            values: HTMLCustomData.Types.AttributeValue[];
        }
        interface _References {
            name: string;
            url: string;
        }
        interface AttributeValue {
            name: string;
            description?: string | _MarkupDescription;
            references?: _References[];
        }
        interface Attribute {
            name: string;
            description?: string | _MarkupDescription;
            valueSet?: string;
            values?: AttributeValue[];
        }
        interface CustomDataTag {
            name: string;
            description?: string | _MarkupDescription;
            attributes: Attribute[];
            references?: _References[];
        }
    }
    namespace Joining {
        function _joinValueSets(...valueSets: Types._ValueSet[]): Types._ValueSet[];
        function _joinValues(...values: Types.AttributeValue[]): Types.AttributeValue[];
        function joinAttributes(...attributes: Types.Attribute[]): Types.Attribute[];
        function filterUniqueName<V extends {
            name: string;
        }>(values: V[]): V[];
        function joinTags(...tags: Types.CustomDataTag[]): Types.CustomDataTag[];
        function flatten<V>(arr: V[][]): V[];
    }
    namespace GenerateCustomData {
        function _createInstance(tagName: string | null | undefined, baseClass: BaseClass): {
            readonly isSSR: boolean;
            readonly tagName: string | null | undefined;
            readonly self: any;
            __hasCustomCSS(): boolean;
            customCSS(): import("../wc-lib").TemplateFnLike<number> | import("../wc-lib").TemplateFnLike<number>[];
            readonly root: import("../wc-lib.all").ExtendedShadowRoot;
            props: any;
            readonly jsxProps: import("../classes/types").JSXDefinition<any, {}>;
            renderToDOM(change?: import("../wc-lib").CHANGE_TYPE | undefined): void;
            preRender(): any;
            postRender(): any;
            firstRender(): any;
            connectedCallback(): any;
            disposables: (() => void)[];
            isMounted: boolean;
            readonly isSSr: boolean;
            readonly $: {
                <K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selector: K): HTMLElementTagNameMap[K] | undefined;
                <K_1 extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selector: K_1): SVGElementTagNameMap[K_1] | undefined;
                <E extends HTMLElement = HTMLElement>(selector: string): E | undefined;
            };
            $$<K_2 extends never>(selector: K_2): unknown[];
            $$<K_3 extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selector: K_3): HTMLElementTagNameMap[K_3][];
            $$<K_4 extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selector: K_4): SVGElementTagNameMap[K_4][];
            $$<E_1 extends Element = Element>(selector: string): E_1[];
            $$(selector: string): HTMLElement[];
            disconnectedCallback(): any;
            layoutMounted(): any;
            mounted(): any;
            unmounted(): any;
            listenProp<P extends Props<any> & {
                [key: string]: any;
            }>(event: import("../wc-lib").PropChangeEvents, listener: (key: keyof P, newValue: P[keyof P], oldValue: P[keyof P]) => void, once?: boolean | undefined): void;
            listenProp<P_1 extends Props<any> & {
                [key: string]: any;
            }, PK extends keyof P_1>(event: import("../wc-lib").PropChangeEvents, listener: (key: PK, newValue: P_1[PK], oldValue: P_1[PK]) => void, once?: boolean | undefined): void;
            listenProp<P_2 extends Props<any> & {
                [key: string]: any;
            }>(event: import("../wc-lib").PropChangeEvents, listener: (key: keyof P_2, newValue: P_2[keyof P_2], oldValue: P_2[keyof P_2]) => void, once?: boolean | undefined): void;
        };
        function _getProps(baseClass: BaseClass): {
            reflect?: PropConfigObject;
            priv?: PropConfigObject;
        };
        function _collectDependencies(baseClass: BaseClass, dependencies?: BaseClass[]): BaseClass[];
        function _propsToTags(props: {
            reflect?: PropConfigObject;
            priv?: PropConfigObject;
        }): Types.Attribute[];
        function _generateComponentCustomData(component: BaseClass): HTMLCustomData;
        function generate(rootComponents: BaseClass[] | BaseClass, includeDependencies: boolean): HTMLCustomData;
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
export declare function generateHTMLCustomData(rootComponents: BaseClass | BaseClass[], includeDependencies?: boolean): HTMLCustomData;
/**
 * Join given HTMLCustomDatas together
 *
 * @param {HTMLCustomData[]} datas - The data objects
 *
 * @returns {HTMLCustomData} The joined custom data
 */
export declare function joinCustomData(...datas: HTMLCustomData[]): HTMLCustomData;
export {};
//# sourceMappingURL=html-custom-data.d.ts.map