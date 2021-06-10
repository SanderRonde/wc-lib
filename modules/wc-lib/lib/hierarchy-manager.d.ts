import { Constructor, InferReturn, InferInstance, DefaultVal } from '../classes/types.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { WebComponentListenableMixinInstance } from './listener.js';
import { Watchable } from './util/manual.js';
import { ClassToObj } from './configurable.js';
import { CHANGE_TYPE } from './enums.js';
/**
 * The type of the `component.listenGP` function
 */
export interface ListenGPType<GA extends {
    globalProps?: {
        [key: string]: any;
    };
}> {
    <GP extends GA['globalProps'] = {
        [key: string]: any;
    }>(event: 'globalPropChange', listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void, once?: boolean): void;
    <GP extends GA['globalProps'] = {
        [key: string]: any;
    }, K extends keyof GP = any>(event: 'globalPropChange', listener: (prop: K, newValue: GP[K], oldValue: GP[K]) => void, once?: boolean): void;
    <GP extends GA['globalProps'] = {
        [key: string]: any;
    }>(event: 'globalPropChange', listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void, once?: boolean): void;
}
/**
 * Global properties functions returned by
 * `component.globalProps()`
 *
 * @template G - The global properties
 */
export declare type GlobalPropsFunctions<G extends {
    [key: string]: any;
}> = {
    /**
     * Gets all global properties
     */
    all: G;
    /**
     * Gets global property with given name
     *
     * @template K - The key
     *
     * @param {Extract<K, string>} key - The
     * 	name of the property to get
     * @returns {G[K]} The property
     */
    get<K extends keyof G>(key: Extract<K, string>): G[K];
    /**
     * Sets global property with given name
     *
     * @template K - The key
     * @template V - The value
     *
     * @param {Extract<K, string>} key - The
     * 	name of the property to get
     * @param {V} value - The value of the
     * 	property to set it to
     * @returns {G[K]} The property
     */
    set<K extends keyof G, V extends G[K]>(key: Extract<K, string>, value: V): void;
};
/**
 * An instance of the webcomponent hierarchy manager mixin's resulting class
 */
export declare type WebComponentHierarchyManagerMixinInstance = InferInstance<WebComponentHierarchyManagerMixinClass> & {
    self: WebComponentHierarchyManagerMixinClass;
};
/**
 * The webcomponent hierarchy manager mixin's resulting class
 */
export declare type WebComponentHierarchyManagerMixinClass = InferReturn<typeof WebComponentHierarchyManagerMixin>;
/**
 * The parent/super type required by the hierarchy manager mixin
 */
export declare type WebComponentHierarchyManagerMixinSuper = Constructor<Pick<WebComponentListenableMixinInstance, 'listen' | 'fire'> & Pick<WebComponentBaseMixinInstance, 'renderToDOM'> & Partial<Pick<WebComponentBaseMixinInstance, 'getRenderArgs'>> & HTMLElement & {
    connectedCallback(): void;
}>;
/**
 * A standalone instance of the hierarchy manager class
 */
export declare class WebComponentHierarchyManagerTypeInstance<GA extends {
    root?: any;
    parent?: any;
    globalProps?: {
        [key: string]: any;
    };
    subtreeProps?: {
        [key: string]: any;
    };
} = {}> {
    /**
     * Registers `element` as the child of this
     * component
     *
     * @template G - Global properties
     * @param {HTMLElement} element - The
     * 	component that is registered as the child of this one
     *
     * @returns {G} The global properties
     */
    registerChild<G extends GA['globalProps'] = {
        [key: string]: any;
    }>(element: HTMLElement): G;
    /**
     * Gets the global properties functions
     *
     * @template G - The global properties
     * @returns {GlobalPropsFunctions<G>} Functions
     * 	that get and set global properties
     */
    globalProps<G extends GA['globalProps'] = {
        [key: string]: any;
    }>(): GlobalPropsFunctions<DefaultVal<G, {
        [key: string]: any;
    }>>;
    /**
     * Gets the root node of the global hierarchy
     *
     * @template T - The type of the root
     *
     * @returns {T} The root
     */
    getRoot<T extends GA['root'] = {}>(): T;
    /**
     * Get the roots of all the subtrees this
     * node is in. Aka all the nodes that called
     * .registerAsSubTreeRoot() in this node's
     * parent tree. (ordered from closest to furthest)
     *
     * @template T - The type of the subtree roots
     *
     * @returns {T[]} The subtree roots
     */
    getSubtreeRoots<T>(): T[];
    /**
     * Register this node as a subtree root and apply
     * its props to all child nodes recursively along
     * with other subtrees' props
     */
    registerAsSubTreeRoot<P extends {
        [key: string]: any;
    }>(props?: P): void;
    /**
     * Set this subtree root's props. Can only be
     * used on nodes that have already marked themselves
     * as subtree roots
     */
    setSubTreeProps<P extends {
        [key: string]: any;
    }>(props: P): void;
    /**
     * Get the joined subtree props that this node is in.
     * For example if the node structure is the following:
     * A > div > div > B > div > this
     * Then "this" will have both A and B's subtree props
     * applied to it. The divs in between A and B will only
     * have A's subtree props applied.
     * The result of getSubTreeProps then is a joining of
     * all of the properties a node is in. So if A's
     * props are { a: true } and B's are { b: true },
     * the result will be { a: true, b: true }.
     * However if there is an overlap, the closest (lowest)
     * node's props will overwrite the furthest (highest up)
     * one's. So in this case B is applied with higher
     * priority than A.
     *
     * @template P - The props that will be returned
     *
     * @returns {P} The joined subtree props
     */
    getSubTreeProps<P extends GA['subtreeProps'] = {
        [key: string]: any;
    }>(): P;
    /**
     * Runs a function for every component in this
     * global hierarchy
     *
     * @template R - The return type of given function
     * @template E - The components on the page's base types
     *
     * @param {(element: WebComponentHierarchyManager) => R} fn - The
     * 	function that is ran on every component
     *
     * @returns {R[]} All return values in an array
     */
    runGlobalFunction<E extends {}, R = any>(fn: (element: E) => R): R[];
    /**
     * Returns the parent of this component
     *
     * @template T - The parent's type
     * @returns {T|null} - The component's parent or
     * 	null if it has none
     */
    getParent<T extends GA['parent'] = {}>(): T | null;
    /**
     * Listeners for global property changes
     *
     * @template GP - The global properties
     *
     * @param {'globalPropChange'} event - The
     * 	event to listen for
     * @param {(prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void} listener -
     * 	The listener that is called when the
     * 	event is fired
     * @param {boolean} [once] - Whether to
     * 	only fire this event once
     */
    listenGP<GP extends GA['globalProps'] = {
        [key: string]: any;
    }>(event: 'globalPropChange', listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void, once?: boolean): void;
    listenGP<GP extends GA['globalProps'] = {
        [key: string]: any;
    }, K extends keyof GP = any>(event: 'globalPropChange', listener: (prop: K, newValue: GP[K], oldValue: GP[K]) => void, once?: boolean): void;
    listenGP<GP extends GA['globalProps'] = {
        [key: string]: any;
    }>(event: 'globalPropChange', listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void, once?: boolean): void;
    /**
     * Returns what should be the second argument to the
     * template fn's function
     *
     * @template CT - The type of change that triggered
     *  this render
     *
     * @param {CT} changeType - The type of change that triggered
     *  this render
     *
     * @returns {{}} To-be-defined return type
     */
    getRenderArgs<CT extends CHANGE_TYPE | number>(changeType: CT): {};
}
/**
 * Mixin for the getRenderArgs function for this mixin
 */
export declare type GetRenderArgsHierarchyManagerMixin<C> = C extends {
    getSubTreeProps(): any;
    globalProps: any;
} ? {
    subtreeProps: Watchable<ReturnType<C['getSubTreeProps']>>;
    globalProps: ReturnType<C['globalProps']> extends GlobalPropsFunctions<infer G> ? Watchable<G> : void;
} : {};
/**
 * The static values of the hierarchy manager class
 */
export declare type WebComponentHierarchyManagerTypeStatic = ClassToObj<typeof WebComponentHierarchyManagerTypeInstance>;
/**
 * A mixin that, when applied, allows for finding out
 * the hierarchy of all component on the page,
 * finding out the parents and children of components
 * as well as finding out the root. It also adds
 * global properties support
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export declare const WebComponentHierarchyManagerMixin: <P extends Constructor<Pick<WebComponentListenableMixinInstance, "listen" | "fire"> & Pick<WebComponentBaseMixinInstance, "renderToDOM"> & Partial<Pick<WebComponentBaseMixinInstance, "getRenderArgs">> & HTMLElement & {
    connectedCallback(): void;
}>>(superFn: P) => {
    new <GA extends {
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
        subtreeProps?: {
            [key: string]: any;
        } | undefined;
    } = {}>(...args: any[]): {
        /**
         * Called when the component is mounted to the dom
         */
        connectedCallback(): void;
        registerChild<G extends GA["globalProps"] = {
            [key: string]: any;
        }>(element: HTMLElement): G;
        registerAsSubTreeRoot<T extends {
            [key: string]: any;
        }>(props?: T): void;
        setSubTreeProps<T_1 extends {
            [key: string]: any;
        }>(props: T_1): void;
        getSubtreeRoots<T_2 = Constructor<Pick<WebComponentListenableMixinInstance, "listen" | "fire"> & Pick<WebComponentBaseMixinInstance, "renderToDOM"> & Partial<Pick<WebComponentBaseMixinInstance, "getRenderArgs">> & HTMLElement & {
            connectedCallback(): void;
        }>>(): T_2[];
        getSubTreeProps<P_1 extends GA["subtreeProps"] = {
            [key: string]: any;
        }>(): P_1;
        globalProps<G_2 extends GA["globalProps"] = {
            [key: string]: any;
        }>(): GlobalPropsFunctions<DefaultVal<G_2, {
            [key: string]: any;
        }>>;
        getRoot<T_4 extends GA["root"] = {}>(): T_4;
        getRenderArgs<CT extends number>(changeType: CT): {};
        runGlobalFunction<E extends {}, R = any>(fn: (element: E) => R): R[];
        getParent<T_6 extends GA["parent"] = {}>(): T_6 | null;
        listenGP<GP extends GA["globalProps"] = {
            [key: string]: any;
        }>(event: 'globalPropChange', listener: (prop: keyof GP, newValue: GP[keyof GP], oldValue: GP[keyof GP]) => void, once?: boolean | undefined): void;
        listenGP<GP_1 extends GA["globalProps"] = {
            [key: string]: any;
        }, K extends keyof GP_1 = any>(event: 'globalPropChange', listener: (prop: K, newValue: GP_1[K], oldValue: GP_1[K]) => void, once?: boolean | undefined): void;
        listen: <EV extends string | number>(event: EV, listener: (...args: import("./listener.js").EventListenerObj[EV]["args"]) => import("./listener.js").EventListenerObj[EV]["returnType"], once?: boolean) => void;
        fire: <EV_1 extends string | number, R_2 extends import("./listener.js").EventListenerObj[EV_1]["returnType"]>(event: EV_1, ...params: import("./listener.js").EventListenerObj[EV_1]["args"]) => R_2[];
        renderToDOM: (change?: number) => void;
        accessKey: string;
        readonly accessKeyLabel: string;
        autocapitalize: string;
        dir: string;
        draggable: boolean;
        hidden: boolean;
        innerText: string;
        lang: string;
        readonly offsetHeight: number;
        readonly offsetLeft: number;
        readonly offsetParent: Element | null;
        readonly offsetTop: number;
        readonly offsetWidth: number;
        spellcheck: boolean;
        title: string;
        translate: boolean;
        click(): void;
        addEventListener<K_1 extends "input" | "progress" | "select" | "fullscreenchange" | "fullscreenerror" | "abort" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "cancel" | "canplay" | "canplaythrough" | "change" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "ended" | "error" | "focus" | "focusin" | "focusout" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "waiting" | "wheel" | "copy" | "cut" | "paste">(type: K_1, listener: (this: HTMLElement, ev: HTMLElementEventMap[K_1]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
        removeEventListener<K_2 extends "input" | "progress" | "select" | "fullscreenchange" | "fullscreenerror" | "abort" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "cancel" | "canplay" | "canplaythrough" | "change" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "ended" | "error" | "focus" | "focusin" | "focusout" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "waiting" | "wheel" | "copy" | "cut" | "paste">(type: K_2, listener: (this: HTMLElement, ev: HTMLElementEventMap[K_2]) => any, options?: boolean | EventListenerOptions | undefined): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
        readonly assignedSlot: HTMLSlotElement | null;
        readonly attributes: NamedNodeMap;
        readonly classList: DOMTokenList;
        className: string;
        readonly clientHeight: number;
        readonly clientLeft: number;
        readonly clientTop: number;
        readonly clientWidth: number;
        id: string;
        readonly localName: string;
        readonly namespaceURI: string | null;
        onfullscreenchange: ((this: Element, ev: Event) => any) | null;
        onfullscreenerror: ((this: Element, ev: Event) => any) | null;
        outerHTML: string;
        readonly ownerDocument: Document;
        readonly prefix: string | null;
        readonly scrollHeight: number;
        scrollLeft: number;
        scrollTop: number;
        readonly scrollWidth: number;
        readonly shadowRoot: ShadowRoot | null;
        slot: string;
        readonly tagName: string;
        attachShadow(init: ShadowRootInit): ShadowRoot;
        closest<K_3 extends "object" | "map" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "link" | "main" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "progress" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "small" | "source" | "span" | "strong" | "style" | "sub" | "summary" | "sup" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "track" | "u" | "ul" | "var" | "video" | "wbr">(selector: K_3): HTMLElementTagNameMap[K_3] | null;
        closest<K_4 extends "symbol" | "filter" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selector: K_4): SVGElementTagNameMap[K_4] | null;
        closest<E_1 extends Element = Element>(selector: string): E_1 | null;
        getAttribute(qualifiedName: string): string | null;
        getAttributeNS(namespace: string | null, localName: string): string | null;
        getAttributeNames(): string[];
        getAttributeNode(name: string): Attr | null;
        getAttributeNodeNS(namespaceURI: string, localName: string): Attr | null;
        getBoundingClientRect(): DOMRect;
        getClientRects(): DOMRectList;
        getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
        getElementsByTagName<K_5 extends "object" | "map" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "link" | "main" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "progress" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "small" | "source" | "span" | "strong" | "style" | "sub" | "summary" | "sup" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "track" | "u" | "ul" | "var" | "video" | "wbr">(qualifiedName: K_5): HTMLCollectionOf<HTMLElementTagNameMap[K_5]>;
        getElementsByTagName<K_6 extends "symbol" | "filter" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(qualifiedName: K_6): HTMLCollectionOf<SVGElementTagNameMap[K_6]>;
        getElementsByTagName(qualifiedName: string): HTMLCollectionOf<Element>;
        getElementsByTagNameNS(namespaceURI: "http://www.w3.org/1999/xhtml", localName: string): HTMLCollectionOf<HTMLElement>;
        getElementsByTagNameNS(namespaceURI: "http://www.w3.org/2000/svg", localName: string): HTMLCollectionOf<SVGElement>;
        getElementsByTagNameNS(namespaceURI: string, localName: string): HTMLCollectionOf<Element>;
        hasAttribute(qualifiedName: string): boolean;
        hasAttributeNS(namespace: string | null, localName: string): boolean;
        hasAttributes(): boolean;
        hasPointerCapture(pointerId: number): boolean;
        insertAdjacentElement(position: InsertPosition, insertedElement: Element): Element | null;
        insertAdjacentHTML(where: InsertPosition, html: string): void;
        insertAdjacentText(where: InsertPosition, text: string): void;
        matches(selectors: string): boolean;
        msGetRegionContent(): any;
        releasePointerCapture(pointerId: number): void;
        removeAttribute(qualifiedName: string): void;
        removeAttributeNS(namespace: string | null, localName: string): void;
        removeAttributeNode(attr: Attr): Attr;
        requestFullscreen(options?: FullscreenOptions | undefined): Promise<void>;
        requestPointerLock(): void;
        scroll(options?: ScrollToOptions | undefined): void;
        scroll(x: number, y: number): void;
        scrollBy(options?: ScrollToOptions | undefined): void;
        scrollBy(x: number, y: number): void;
        scrollIntoView(arg?: boolean | ScrollIntoViewOptions | undefined): void;
        scrollTo(options?: ScrollToOptions | undefined): void;
        scrollTo(x: number, y: number): void;
        setAttribute(qualifiedName: string, value: string): void;
        setAttributeNS(namespace: string | null, qualifiedName: string, value: string): void;
        setAttributeNode(attr: Attr): Attr | null;
        setAttributeNodeNS(attr: Attr): Attr | null;
        setPointerCapture(pointerId: number): void;
        toggleAttribute(qualifiedName: string, force?: boolean | undefined): boolean;
        webkitMatchesSelector(selectors: string): boolean;
        readonly baseURI: string;
        readonly childNodes: NodeListOf<ChildNode>;
        readonly firstChild: ChildNode | null;
        readonly isConnected: boolean;
        readonly lastChild: ChildNode | null;
        readonly nextSibling: ChildNode | null;
        readonly nodeName: string;
        readonly nodeType: number;
        nodeValue: string | null;
        readonly parentElement: HTMLElement | null;
        readonly parentNode: (Node & ParentNode) | null;
        readonly previousSibling: ChildNode | null;
        textContent: string | null;
        appendChild<T_8 extends Node>(newChild: T_8): T_8;
        cloneNode(deep?: boolean | undefined): Node;
        compareDocumentPosition(other: Node): number;
        contains(other: Node | null): boolean;
        getRootNode(options?: GetRootNodeOptions | undefined): Node;
        hasChildNodes(): boolean;
        insertBefore<T_9 extends Node>(newChild: T_9, refChild: Node | null): T_9;
        isDefaultNamespace(namespace: string | null): boolean;
        isEqualNode(otherNode: Node | null): boolean;
        isSameNode(otherNode: Node | null): boolean;
        lookupNamespaceURI(prefix: string | null): string | null;
        lookupPrefix(namespace: string | null): string | null;
        normalize(): void;
        removeChild<T_10 extends Node>(oldChild: T_10): T_10;
        replaceChild<T_11 extends Node>(newChild: Node, oldChild: T_11): T_11;
        readonly ATTRIBUTE_NODE: number;
        readonly CDATA_SECTION_NODE: number;
        readonly COMMENT_NODE: number;
        readonly DOCUMENT_FRAGMENT_NODE: number;
        readonly DOCUMENT_NODE: number;
        readonly DOCUMENT_POSITION_CONTAINED_BY: number;
        readonly DOCUMENT_POSITION_CONTAINS: number;
        readonly DOCUMENT_POSITION_DISCONNECTED: number;
        readonly DOCUMENT_POSITION_FOLLOWING: number;
        readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
        readonly DOCUMENT_POSITION_PRECEDING: number;
        readonly DOCUMENT_TYPE_NODE: number;
        readonly ELEMENT_NODE: number;
        readonly ENTITY_NODE: number;
        readonly ENTITY_REFERENCE_NODE: number;
        readonly NOTATION_NODE: number;
        readonly PROCESSING_INSTRUCTION_NODE: number;
        readonly TEXT_NODE: number;
        dispatchEvent(event: Event): boolean;
        animate(keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions | undefined): Animation;
        getAnimations(): Animation[];
        after(...nodes: (string | Node)[]): void;
        before(...nodes: (string | Node)[]): void;
        remove(): void;
        replaceWith(...nodes: (string | Node)[]): void;
        innerHTML: string;
        readonly nextElementSibling: Element | null;
        readonly previousElementSibling: Element | null;
        readonly childElementCount: number;
        readonly children: HTMLCollection;
        readonly firstElementChild: Element | null;
        readonly lastElementChild: Element | null;
        append(...nodes: (string | Node)[]): void;
        prepend(...nodes: (string | Node)[]): void;
        querySelector<K_7 extends "object" | "map" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "link" | "main" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "progress" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "small" | "source" | "span" | "strong" | "style" | "sub" | "summary" | "sup" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "track" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K_7): HTMLElementTagNameMap[K_7] | null;
        querySelector<K_8 extends "symbol" | "filter" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K_8): SVGElementTagNameMap[K_8] | null;
        querySelector<E_2 extends Element = Element>(selectors: string): E_2 | null;
        querySelectorAll<K_9 extends "object" | "map" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "link" | "main" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "progress" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "small" | "source" | "span" | "strong" | "style" | "sub" | "summary" | "sup" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "track" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K_9): NodeListOf<HTMLElementTagNameMap[K_9]>;
        querySelectorAll<K_10 extends "symbol" | "filter" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K_10): NodeListOf<SVGElementTagNameMap[K_10]>;
        querySelectorAll<E_3 extends Element = Element>(selectors: string): NodeListOf<E_3>;
        oncopy: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
        oncut: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
        onpaste: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
        readonly style: CSSStyleDeclaration;
        contentEditable: string;
        enterKeyHint: string;
        inputMode: string;
        readonly isContentEditable: boolean;
        onabort: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null;
        onanimationcancel: ((this: GlobalEventHandlers, ev: AnimationEvent) => any) | null;
        onanimationend: ((this: GlobalEventHandlers, ev: AnimationEvent) => any) | null;
        onanimationiteration: ((this: GlobalEventHandlers, ev: AnimationEvent) => any) | null;
        onanimationstart: ((this: GlobalEventHandlers, ev: AnimationEvent) => any) | null;
        onauxclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        onblur: ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null;
        oncancel: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        oncanplay: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        oncanplaythrough: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onchange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        onclose: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        oncontextmenu: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        oncuechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        ondblclick: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        ondrag: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
        ondragend: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
        ondragenter: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
        ondragexit: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        ondragleave: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
        ondragover: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
        ondragstart: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
        ondrop: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null;
        ondurationchange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onemptied: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onended: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onerror: OnErrorEventHandler;
        onfocus: ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null;
        ongotpointercapture: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
        oninput: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        oninvalid: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onkeydown: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
        onkeypress: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
        onkeyup: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null;
        onload: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onloadeddata: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onloadedmetadata: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onloadstart: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onlostpointercapture: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
        onmousedown: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        onmouseenter: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        onmouseleave: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        onmousemove: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        onmouseout: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        onmouseover: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        onmouseup: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
        onpause: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onplay: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onplaying: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onpointercancel: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
        onpointerdown: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
        onpointerenter: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
        onpointerleave: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
        onpointermove: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
        onpointerout: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
        onpointerover: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
        onpointerup: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null;
        onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent<EventTarget>) => any) | null;
        onratechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onreset: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onresize: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null;
        onscroll: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onsecuritypolicyviolation: ((this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent) => any) | null;
        onseeked: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onseeking: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onselect: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onselectionchange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onselectstart: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onstalled: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onsubmit: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onsuspend: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        ontimeupdate: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        ontoggle: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        ontouchcancel?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null | undefined;
        ontouchend?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null | undefined;
        ontouchmove?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null | undefined;
        ontouchstart?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null | undefined;
        ontransitioncancel: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
        ontransitionend: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
        ontransitionrun: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
        ontransitionstart: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
        onvolumechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onwaiting: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null;
        autofocus: boolean;
        readonly dataset: DOMStringMap;
        nonce?: string | undefined;
        tabIndex: number;
        blur(): void;
        focus(options?: FocusOptions | undefined): void;
    };
} & P;
//# sourceMappingURL=hierarchy-manager.d.ts.map