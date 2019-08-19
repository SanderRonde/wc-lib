import { Constructor, InferInstance, InferReturn, DefaultVal, WebComponentThemeManagerMixinInstance, DefaultValUnknown, WebComponentHierarchyManagerMixinInstance } from '../classes/types.js';
import { EventListenerObj, WebComponentListenableMixinInstance, ListenerSet, GetEvents } from './listener.js';
import { ListenGPType, GlobalPropsFunctions } from './hierarchy-manager.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { WebComponentI18NManagerMixinLike } from './i18n-manager.js';
import { WebComponentDefinerMixinInstance } from './definer.js';
import { CHANGE_TYPE } from './template-fn.js';
import { Props } from './props.js';
/**
 * Gets GA['selectors'] from the class generic type
 */
export declare type GetEls<GA extends {
    selectors?: SelectorMap;
}> = Required<GA>['selectors'] extends undefined ? {} : DefaultVal<Required<GA>['selectors'], SelectorMap>;
/**
 * The selector map type that is used to infer
 * typed HTML and typed CSS
 */
export interface SelectorMap {
    /**
     * All child elements of this component by ID
     */
    IDS?: {
        [key: string]: HTMLElement | SVGElement;
    };
    /**
     * All child elements of this component by class
     */
    CLASSES?: {
        [key: string]: HTMLElement | SVGElement;
    };
    /**
     * All child elements of this component by tag name
     */
    TAGS?: {
        [key: string]: HTMLElement | SVGElement;
    };
    /**
     * Togglable classes that can be put onto other elements.
     * The string value is used as options for the toggles.
     * For example if the string value is 'a'|'b'
     * the suggestions will be 'a'|'b'
     */
    TOGGLES?: string;
    /**
     * Attributes that can be put onto other elements.
     * The string value is used as options for the toggles.
     * For example if the string value is 'a'|'b'
     * the suggestions will be 'a'|'b'
     */
    ATTRIBUTES?: string;
}
/**
 * An IDMap that is used as `component.$`
 */
export declare type IDMapFn<IDS extends SelectorMap> = {
    /**
     * Query this component's root for given selector
     */
    <K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | undefined;
    <K extends keyof SVGElementTagNameMap>(selector: K): SVGElementTagNameMap[K] | undefined;
    <E extends HTMLElement = HTMLElement>(selector: string): E | undefined;
} & IDS['IDS'];
/**
 * Type of property change events that can be listened for
 */
export declare type PropChangeEvents = 'beforePropChange' | 'propChange';
/**
 * The parent/super type required by the `WebComponentMixin` mixin
 */
export declare type WebComponentSuper = Constructor<HTMLElement & Pick<WebComponentDefinerMixinInstance, '___definerClass'> & Pick<WebComponentBaseMixinInstance, 'root' | 'self' | 'renderToDOM'> & Pick<WebComponentListenableMixinInstance, 'listen' | 'fire' | 'clearListener' | 'listenerMap'> & Partial<Pick<WebComponentThemeManagerMixinInstance, 'getTheme' | 'getThemeName' | 'setTheme'>> & Partial<Pick<WebComponentI18NManagerMixinLike, 'getLang' | 'setLang' | '__' | '__prom'>> & Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'registerChild' | 'globalProps' | 'getRoot' | 'getParent' | 'listenGP' | 'runGlobalFunction'>> & {
    connectedCallback(): void;
    disconnectedCallback?(): void;
}>;
/**
 * An instance of the webcomponent mixin class
 */
export declare type WebComponentMixinInstance = InferInstance<WebComponentMixinClass>;
/**
 * The webcomponent mixin class
 */
export declare type WebComponentMixinClass = InferReturn<typeof WebComponentMixin>;
/**
 * The class that wraps up all subclasses of a webcomponent.
 * This version takes two type parameters that allow for the
 * type parameters to be specified as well as the
 * ID map.
 *
 * @template ELS - The elements found in this component's HTML
 * @template E - An object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
export declare const WebComponentMixin: <P extends Constructor<HTMLElement & Pick<WebComponentDefinerMixinInstance, "___definerClass"> & Pick<WebComponentBaseMixinInstance, "renderToDOM" | "root" | "self"> & Pick<WebComponentListenableMixinInstance, "listen" | "fire" | "clearListener" | "listenerMap"> & Partial<Pick<WebComponentThemeManagerMixinInstance, "getTheme" | "getThemeName" | "setTheme">> & Partial<Pick<WebComponentI18NManagerMixinLike, "setLang" | "getLang" | "__prom" | "__">> & Partial<Pick<WebComponentHierarchyManagerMixinInstance, "globalProps" | "listenGP" | "registerChild" | "getRoot" | "getParent" | "runGlobalFunction">> & {
    connectedCallback(): void;
}>>(superFn: P) => {
    new <GA extends {
        i18n?: any;
        langs?: string | undefined;
        events?: EventListenerObj | undefined;
        themes?: {
            [key: string]: any;
        } | undefined;
        selectors?: SelectorMap | undefined;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): {
        /**
         * An array of functions that get called when this
         * component gets unmounted. These will dispose
         * of any open listeners or similar garbage
         */
        disposables: (() => void)[];
        /**
         * Whether this component has been mounted
         */
        isMounted: boolean;
        /**
         * An object that contains all children
         * of this element mapped by their ID.
         * This object can also be called with a
         * query, which is just a proxy call to
         * `this.root.querySelector`.
         *
         * **Note:** This function returns `undefined`
         * 	when no element can be found instead of
         * 	null.
         *
         * @readonly
         */
        readonly $: IDMapFn<ELS>;
        /**
         * Proxy for `this.root.querySelectorAll(selector)`
         *
         * @template E - An element
         * @param {string} selector - The query to use
         *
         * @returns {NodeListOf<HTMLElement|SVGElement|E>} A list of
         * 	nodes that are the result of this query
         */
        $$<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selector: K): NodeListOf<HTMLElementTagNameMap[K]>;
        /**
         * Proxy for `this.root.querySelectorAll(selector)`
         *
         * @template E - An element
         * @param {string} selector - The query to use
         *
         * @returns {NodeListOf<HTMLElement|SVGElement|E>} A list of
         * 	nodes that are the result of this query
         */
        $$<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selector: K): NodeListOf<SVGElementTagNameMap[K]>;
        /**
         * Proxy for `this.root.querySelectorAll(selector)`
         *
         * @template E - An element
         * @param {string} selector - The query to use
         *
         * @returns {NodeListOf<HTMLElement|SVGElement|E>} A list of
         * 	nodes that are the result of this query
         */
        $$<E extends Element = Element>(selector: string): NodeListOf<E>;
        /**
         * Called when the component is mounted to the dom.
         * Be sure to always call `super.connectedCallback()`
         * if you override this method
         */
        connectedCallback(): void;
        /**
         * Called when the component is unmounted from the dom
         * Be sure to always call `super.disconnectedCallback()`
         * 	if you override this method
         */
        disconnectedCallback(): void;
        /**
         * Called when the component is mounted to the dom for the first time.
         * This will be part of the "constructor" and will slow down the initial render
         */
        layoutMounted(): void;
        /**
         * Called when the component is mounted to the dom and is ready to be manipulated
         */
        mounted(): void;
        /**
         * Called when the component is removed from the dom
         */
        unmounted(): void;
        /**
         * Listeners for property change events on this node
         *
         * @template P - The properties of this node
         *
         * @param {PropChangeEvents} event - The type of change
         * 	to listen for. Either a `propChange` or a
         * 	`beforePropChange` event
         * @param {(key: keyof P, newValue: P[keyof P], oldValue: P[keyof P]) => void} listener - The
         * 	listener that should be called when the event is fired.
         * 	This listener is called with the name of the changed
         * 	property, the new value and the old value respectively
         * @param {boolean} [once] - Whether the listener should only
         * 	be called once
         */
        listenProp<P extends Props & {
            [key: string]: any;
        }>(event: "beforePropChange" | "propChange", listener: (key: keyof P, newValue: P[keyof P], oldValue: P[keyof P]) => void, once?: boolean | undefined): void;
        /**
         * Listeners for property change events on this node
         *
         * @template P - The properties of this node
         *
         * @param {PropChangeEvents} event - The type of change
         * 	to listen for. Either a `propChange` or a
         * 	`beforePropChange` event
         * @param {(key: keyof P, newValue: P[keyof P], oldValue: P[keyof P]) => void} listener - The
         * 	listener that should be called when the event is fired.
         * 	This listener is called with the name of the changed
         * 	property, the new value and the old value respectively
         * @param {boolean} [once] - Whether the listener should only
         * 	be called once
         */
        listenProp<P extends Props & {
            [key: string]: any;
        }, PK extends keyof P>(event: "beforePropChange" | "propChange", listener: (key: PK, newValue: P[PK], oldValue: P[PK]) => void, once?: boolean | undefined): void;
        /**
         * A map that maps every event name to
         * a set containing all of its listeners
         *
         * @readonly
         */
        readonly listenerMap: ListenerSet<E>;
        /**
         * Listens for given event and fires
         * the listener when it's triggered
         *
         * @template EV - The event's name
         *
         * @param {EV} event - The event's name
         * @param {(...args: E[EV]['args']) => E[EV]['returnType']} listener - The
         * 	listener called when the event is fired
         * @param {boolean} [once] - Whether to only
         * 	call this listener once (false by default)
         */
        listen: <EV extends keyof E>(event: EV, listener: (...args: E[EV]["args"]) => E[EV]["returnType"], once?: boolean) => void;
        /**
         * Clears all listeners on this component for
         * given event
         *
         * @template EV - The name of the event
         *
         * @param {EV} event - The name of the event to clear
         * @param {(...args: E[EV]['args']) => E[EV]['returnType']} [listener] - A
         * 	specific listener to clear. If not passed, clears all
         * 	listeners for the event
         */
        clearListener: <EV extends keyof E>(event: EV, listener?: ((...args: E[EV]["args"]) => E[EV]["returnType"]) | undefined) => void;
        /**
         * Fires given event on this component
         * with given params, returning an array
         * containing the return values of all
         * triggered listeners
         *
         * @template EV - The event's name
         * @template R - The return type of the
         * 	event's listeners
         *
         * @param {EV} event - The event's name
         * @param {E[EV]['args']} params - The parameters
         * 	passed to the listeners when they are
         * 	called
         *
         * @returns {R[]} An array containing the
         * 	return values of all triggered
         * 	listeners
         */
        fire: <EV extends keyof E, R extends E[EV]["returnType"]>(event: EV, ...params: E[EV]["args"]) => R[];
        /**
         * Sets the current language
         *
         * @param {string} lang - The language to set it to, a regular string
         */
        setLang: <L extends string = DefaultValUnknown<GA["langs"], string>>(lang: L) => Promise<void>;
        /**
         * Gets the currently active language
         */
        getLang: () => string | DefaultValUnknown<GA["langs"], string>;
        /**
         * Returns a promise that resolves to the message. You will generally
         * want to use this inside the class itself since it resolves to a simple promise.
         *
         * **Note:** Does not call the `options.returner` function before returning.
         *
         * @param {Extract<keyof GA['i18n'], string>} key - The key to search for in the messages file
         * @param {any[]} [values] - Optional values passed to the `getMessage` function
         * 		that can be used as placeholders or something similar
         *
         * @returns {Promise<string>} A promise that resolves to the found message
         */
        __prom: <I extends GA["i18n"] = {
            [key: string]: any;
        }>(key: Extract<keyof I, string>, ...values: any[]) => Promise<string>;
        /**
         * Returns either a string or whatever the `options.returner` function
         * returns. If you have not set the `options.returner` function, this will
         * return either a string or a promise that resolves to a string. Since
         * this function calls `options.returner` with the promise if the i18n file
         * is not loaded yet.
         *
         * You will generally want to use this function inside your templates since it
         * allows for the `options.returner` function to return a template-friendly
         * value that can display a placeholder or something of the sort
         *
         * @template R - The return value of your returner function
         * @param {Extract<keyof GA['i18n'], string>} key - The key to search for in the messages file
         * @param {any[]} [values] - Optional values passed to the `getMessage` function
         * 		that can be used as placeholders or something similar
         *
         * @returns {string|R} A promise that resolves to the found message
         */
        __: <R, I extends GA["i18n"] = {
            [key: string]: any;
        }>(key: Extract<keyof I, string>, ...values: any[]) => string | R;
        /**
         * Gets the name of the current theme
         *
         * @returns {string} The name of the current theme
         */
        getThemeName: <N extends GA["themes"] = {
            [key: string]: any;
        }>() => Extract<keyof N, string>;
        /**
         * Gets the current theme's theme object
         *
         * @template T - The themes type
         *
         * @returns {T[keyof T]} A theme instance type
         */
        getTheme: <T extends GA["themes"] = {
            [key: string]: any;
        }>() => T[keyof T];
        /**
         * Sets the theme of this component and any other
         * component in its hierarchy to the passed theme
         *
         * @template N - The theme name
         */
        setTheme: <N extends GA["themes"] = {
            [key: string]: any;
        }>(themeName: Extract<keyof N, string>) => void;
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
        registerChild: <G extends GA["globalProps"] = {
            [key: string]: any;
        }>(element: HTMLElement) => G;
        /**
         * Gets the global properties functions
         *
         * @template G - The global properties
         * @returns {GlobalPropsFunctions<G>} Functions
         * 	that get and set global properties
         */
        globalProps: <G extends GA["globalProps"] = {
            [key: string]: any;
        }>() => GlobalPropsFunctions<DefaultVal<G, {
            [key: string]: any;
        }>>;
        /**
         * Gets the root node of the global hierarchy
         *
         * @template T - The type of the root
         *
         * @returns {T} The root
         */
        getRoot: <T extends GA["root"] = {}>() => T;
        /**
         * Returns the parent of this component
         *
         * @template T - The parent's type
         * @returns {T|null} - The component's parent or
         * 	null if it has none
         */
        getParent: <T extends GA["parent"] = {}>() => T | null;
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
        listenGP: ListenGPType<GA>;
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
        runGlobalFunction: <E extends {}, R = any>(fn: (element: E) => R) => R[];
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
        addEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
        removeEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
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
        readonly prefix: string | null;
        readonly scrollHeight: number;
        scrollLeft: number;
        scrollTop: number;
        readonly scrollWidth: number;
        readonly shadowRoot: ShadowRoot | null;
        slot: string;
        readonly tagName: string;
        attachShadow(init: ShadowRootInit): ShadowRoot;
        closest<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selector: K): HTMLElementTagNameMap[K] | null;
        closest<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selector: K): SVGElementTagNameMap[K] | null;
        closest(selector: string): Element | null;
        getAttribute(qualifiedName: string): string | null;
        getAttributeNS(namespace: string | null, localName: string): string | null;
        getAttributeNames(): string[];
        getAttributeNode(name: string): Attr | null;
        getAttributeNodeNS(namespaceURI: string, localName: string): Attr | null;
        getBoundingClientRect(): DOMRect | ClientRect;
        getClientRects(): ClientRectList | DOMRectList;
        getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
        getElementsByTagName<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
        getElementsByTagName<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(qualifiedName: K): HTMLCollectionOf<SVGElementTagNameMap[K]>;
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
        readonly ownerDocument: Document | null;
        readonly parentElement: HTMLElement | null;
        readonly parentNode: (Node & ParentNode) | null;
        readonly previousSibling: Node | null;
        textContent: string | null;
        appendChild<T extends Node>(newChild: T): T;
        cloneNode(deep?: boolean | undefined): Node;
        compareDocumentPosition(other: Node): number;
        contains(other: Node | null): boolean;
        getRootNode(options?: GetRootNodeOptions | undefined): Node;
        hasChildNodes(): boolean;
        insertBefore<T extends Node>(newChild: T, refChild: Node | null): T;
        isDefaultNamespace(namespace: string | null): boolean;
        isEqualNode(otherNode: Node | null): boolean;
        isSameNode(otherNode: Node | null): boolean;
        lookupNamespaceURI(prefix: string | null): string | null;
        lookupPrefix(namespace: string | null): string | null;
        normalize(): void;
        removeChild<T extends Node>(oldChild: T): T;
        replaceChild<T extends Node>(newChild: Node, oldChild: T): T;
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
        readonly childElementCount: number;
        readonly children: HTMLCollection;
        readonly firstElementChild: Element | null;
        readonly lastElementChild: Element | null;
        append(...nodes: (string | Node)[]): void;
        prepend(...nodes: (string | Node)[]): void;
        querySelector<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): HTMLElementTagNameMap[K] | null;
        querySelector<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): SVGElementTagNameMap[K] | null;
        querySelector<E extends Element = Element>(selectors: string): E | null;
        querySelectorAll<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
        querySelectorAll<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
        querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
        readonly nextElementSibling: Element | null;
        readonly previousElementSibling: Element | null;
        after(...nodes: (string | Node)[]): void;
        before(...nodes: (string | Node)[]): void;
        remove(): void;
        replaceWith(...nodes: (string | Node)[]): void;
        innerHTML: string;
        animate(keyframes: PropertyIndexedKeyframes | Keyframe[] | null, options?: number | KeyframeAnimationOptions | undefined): Animation;
        getAnimations(): Animation[];
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
        onloadend: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
        onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
        ontouchcancel: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
        ontouchend: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
        ontouchmove: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
        ontouchstart: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
        ontransitioncancel: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
        ontransitionend: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
        ontransitionrun: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
        ontransitionstart: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
        onvolumechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onwaiting: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null;
        oncopy: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
        oncut: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
        onpaste: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
        contentEditable: string;
        inputMode: string;
        readonly isContentEditable: boolean;
        readonly dataset: DOMStringMap;
        nonce?: string | undefined;
        tabIndex: number;
        blur(): void;
        focus(options?: FocusOptions | undefined): void;
        readonly style: CSSStyleDeclaration;
        ___definerClass: import("./definer.js").DefinerClass;
        renderToDOM: (change?: CHANGE_TYPE) => void;
        readonly root: import("./base.js").ExtendedShadowRoot;
        readonly self: {
            new (...args: any[]): {
                readonly self: any & Constructor<Pick<WebComponentDefinerMixinInstance, "___definerClass"> & HTMLElement> & Pick<{
                    new (...args: any[]): {
                        ___definerClass: import("./definer.js").DefinerClass;
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
                        addEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
                        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
                        removeEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
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
                        readonly prefix: string | null;
                        readonly scrollHeight: number;
                        scrollLeft: number;
                        scrollTop: number;
                        readonly scrollWidth: number;
                        readonly shadowRoot: ShadowRoot | null;
                        slot: string;
                        readonly tagName: string;
                        attachShadow(init: ShadowRootInit): ShadowRoot;
                        closest<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selector: K): HTMLElementTagNameMap[K] | null;
                        closest<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selector: K): SVGElementTagNameMap[K] | null;
                        closest(selector: string): Element | null;
                        getAttribute(qualifiedName: string): string | null;
                        getAttributeNS(namespace: string | null, localName: string): string | null;
                        getAttributeNames(): string[];
                        getAttributeNode(name: string): Attr | null;
                        getAttributeNodeNS(namespaceURI: string, localName: string): Attr | null;
                        getBoundingClientRect(): DOMRect | ClientRect;
                        getClientRects(): ClientRectList | DOMRectList;
                        getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
                        getElementsByTagName<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
                        getElementsByTagName<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(qualifiedName: K): HTMLCollectionOf<SVGElementTagNameMap[K]>;
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
                        readonly ownerDocument: Document | null;
                        readonly parentElement: HTMLElement | null;
                        readonly parentNode: (Node & ParentNode) | null;
                        readonly previousSibling: Node | null;
                        textContent: string | null;
                        appendChild<T extends Node>(newChild: T): T;
                        cloneNode(deep?: boolean | undefined): Node;
                        compareDocumentPosition(other: Node): number;
                        contains(other: Node | null): boolean;
                        getRootNode(options?: GetRootNodeOptions | undefined): Node;
                        hasChildNodes(): boolean;
                        insertBefore<T extends Node>(newChild: T, refChild: Node | null): T;
                        isDefaultNamespace(namespace: string | null): boolean;
                        isEqualNode(otherNode: Node | null): boolean;
                        isSameNode(otherNode: Node | null): boolean;
                        lookupNamespaceURI(prefix: string | null): string | null;
                        lookupPrefix(namespace: string | null): string | null;
                        normalize(): void;
                        removeChild<T extends Node>(oldChild: T): T;
                        replaceChild<T extends Node>(newChild: Node, oldChild: T): T;
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
                        readonly childElementCount: number;
                        readonly children: HTMLCollection;
                        readonly firstElementChild: Element | null;
                        readonly lastElementChild: Element | null;
                        append(...nodes: (string | Node)[]): void;
                        prepend(...nodes: (string | Node)[]): void;
                        querySelector<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): HTMLElementTagNameMap[K] | null;
                        querySelector<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): SVGElementTagNameMap[K] | null;
                        querySelector<E extends Element = Element>(selectors: string): E | null;
                        querySelectorAll<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
                        querySelectorAll<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
                        querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
                        readonly nextElementSibling: Element | null;
                        readonly previousElementSibling: Element | null;
                        after(...nodes: (string | Node)[]): void;
                        before(...nodes: (string | Node)[]): void;
                        remove(): void;
                        replaceWith(...nodes: (string | Node)[]): void;
                        innerHTML: string;
                        animate(keyframes: PropertyIndexedKeyframes | Keyframe[] | null, options?: number | KeyframeAnimationOptions | undefined): Animation;
                        getAnimations(): Animation[];
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
                        onloadend: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
                        onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
                        ontouchcancel: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                        ontouchend: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                        ontouchmove: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                        ontouchstart: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                        ontransitioncancel: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                        ontransitionend: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                        ontransitionrun: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                        ontransitionstart: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                        onvolumechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
                        onwaiting: ((this: GlobalEventHandlers, ev: Event) => any) | null;
                        onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null;
                        oncopy: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                        oncut: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                        onpaste: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                        contentEditable: string;
                        inputMode: string;
                        readonly isContentEditable: boolean;
                        readonly dataset: DOMStringMap;
                        nonce?: string | undefined;
                        tabIndex: number;
                        blur(): void;
                        focus(options?: FocusOptions | undefined): void;
                        readonly style: CSSStyleDeclaration;
                    };
                    dependencies?: {
                        define(isDevelopment?: boolean | undefined, isRoot?: boolean | undefined): void;
                    }[] | null | undefined;
                    is: string;
                    define(isDevelopment?: boolean, isRoot?: boolean): void;
                } & Constructor<HTMLElement>, "define" | "is">;
                __hasCustomCSS(): boolean;
                customCSS(): import("./template-fn.js").TemplateFnLike<number> | import("./template-fn.js").TemplateFnLike<number>[];
                readonly root: import("./base.js").ExtendedShadowRoot;
                props: any;
                readonly jsxProps: import("../classes/types.js").JSXDefinition<any, {}>;
                renderToDOM(change?: CHANGE_TYPE): void;
                preRender(): any;
                postRender(): any;
                firstRender(): any;
                connectedCallback(): void;
                ___definerClass: import("./definer.js").DefinerClass;
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
                addEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
                addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
                removeEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
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
                readonly prefix: string | null;
                readonly scrollHeight: number;
                scrollLeft: number;
                scrollTop: number;
                readonly scrollWidth: number;
                readonly shadowRoot: ShadowRoot | null;
                slot: string;
                readonly tagName: string;
                attachShadow(init: ShadowRootInit): ShadowRoot;
                closest<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selector: K): HTMLElementTagNameMap[K] | null;
                closest<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selector: K): SVGElementTagNameMap[K] | null;
                closest(selector: string): Element | null;
                getAttribute(qualifiedName: string): string | null;
                getAttributeNS(namespace: string | null, localName: string): string | null;
                getAttributeNames(): string[];
                getAttributeNode(name: string): Attr | null;
                getAttributeNodeNS(namespaceURI: string, localName: string): Attr | null;
                getBoundingClientRect(): DOMRect | ClientRect;
                getClientRects(): ClientRectList | DOMRectList;
                getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
                getElementsByTagName<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
                getElementsByTagName<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(qualifiedName: K): HTMLCollectionOf<SVGElementTagNameMap[K]>;
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
                readonly ownerDocument: Document | null;
                readonly parentElement: HTMLElement | null;
                readonly parentNode: (Node & ParentNode) | null;
                readonly previousSibling: Node | null;
                textContent: string | null;
                appendChild<T extends Node>(newChild: T): T;
                cloneNode(deep?: boolean | undefined): Node;
                compareDocumentPosition(other: Node): number;
                contains(other: Node | null): boolean;
                getRootNode(options?: GetRootNodeOptions | undefined): Node;
                hasChildNodes(): boolean;
                insertBefore<T extends Node>(newChild: T, refChild: Node | null): T;
                isDefaultNamespace(namespace: string | null): boolean;
                isEqualNode(otherNode: Node | null): boolean;
                isSameNode(otherNode: Node | null): boolean;
                lookupNamespaceURI(prefix: string | null): string | null;
                lookupPrefix(namespace: string | null): string | null;
                normalize(): void;
                removeChild<T extends Node>(oldChild: T): T;
                replaceChild<T extends Node>(newChild: Node, oldChild: T): T;
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
                readonly childElementCount: number;
                readonly children: HTMLCollection;
                readonly firstElementChild: Element | null;
                readonly lastElementChild: Element | null;
                append(...nodes: (string | Node)[]): void;
                prepend(...nodes: (string | Node)[]): void;
                querySelector<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): HTMLElementTagNameMap[K] | null;
                querySelector<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): SVGElementTagNameMap[K] | null;
                querySelector<E extends Element = Element>(selectors: string): E | null;
                querySelectorAll<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
                querySelectorAll<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
                querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
                readonly nextElementSibling: Element | null;
                readonly previousElementSibling: Element | null;
                after(...nodes: (string | Node)[]): void;
                before(...nodes: (string | Node)[]): void;
                remove(): void;
                replaceWith(...nodes: (string | Node)[]): void;
                innerHTML: string;
                animate(keyframes: PropertyIndexedKeyframes | Keyframe[] | null, options?: number | KeyframeAnimationOptions | undefined): Animation;
                getAnimations(): Animation[];
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
                onloadend: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
                onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
                ontouchcancel: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontouchend: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontouchmove: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontouchstart: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontransitioncancel: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                ontransitionend: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                ontransitionrun: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                ontransitionstart: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                onvolumechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
                onwaiting: ((this: GlobalEventHandlers, ev: Event) => any) | null;
                onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null;
                oncopy: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                oncut: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                onpaste: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                contentEditable: string;
                inputMode: string;
                readonly isContentEditable: boolean;
                readonly dataset: DOMStringMap;
                nonce?: string | undefined;
                tabIndex: number;
                blur(): void;
                focus(options?: FocusOptions | undefined): void;
                readonly style: CSSStyleDeclaration;
            };
            html: import("./template-fn.js").TemplateFnLike<number> | null;
            css: import("./template-fn.js").TemplateFnLike<number> | import("./template-fn.js").TemplateFnLike<number>[] | null;
            __constructedCSSChanged(_element: {
                readonly self: any & Constructor<Pick<WebComponentDefinerMixinInstance, "___definerClass"> & HTMLElement> & Pick<{
                    new (...args: any[]): {
                        ___definerClass: import("./definer.js").DefinerClass;
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
                        addEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
                        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
                        removeEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
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
                        readonly prefix: string | null;
                        readonly scrollHeight: number;
                        scrollLeft: number;
                        scrollTop: number;
                        readonly scrollWidth: number;
                        readonly shadowRoot: ShadowRoot | null;
                        slot: string;
                        readonly tagName: string;
                        attachShadow(init: ShadowRootInit): ShadowRoot;
                        closest<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selector: K): HTMLElementTagNameMap[K] | null;
                        closest<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selector: K): SVGElementTagNameMap[K] | null;
                        closest(selector: string): Element | null;
                        getAttribute(qualifiedName: string): string | null;
                        getAttributeNS(namespace: string | null, localName: string): string | null;
                        getAttributeNames(): string[];
                        getAttributeNode(name: string): Attr | null;
                        getAttributeNodeNS(namespaceURI: string, localName: string): Attr | null;
                        getBoundingClientRect(): DOMRect | ClientRect;
                        getClientRects(): ClientRectList | DOMRectList;
                        getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
                        getElementsByTagName<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
                        getElementsByTagName<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(qualifiedName: K): HTMLCollectionOf<SVGElementTagNameMap[K]>;
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
                        readonly ownerDocument: Document | null;
                        readonly parentElement: HTMLElement | null;
                        readonly parentNode: (Node & ParentNode) | null;
                        readonly previousSibling: Node | null;
                        textContent: string | null;
                        appendChild<T extends Node>(newChild: T): T;
                        cloneNode(deep?: boolean | undefined): Node;
                        compareDocumentPosition(other: Node): number;
                        contains(other: Node | null): boolean;
                        getRootNode(options?: GetRootNodeOptions | undefined): Node;
                        hasChildNodes(): boolean;
                        insertBefore<T extends Node>(newChild: T, refChild: Node | null): T;
                        isDefaultNamespace(namespace: string | null): boolean;
                        isEqualNode(otherNode: Node | null): boolean;
                        isSameNode(otherNode: Node | null): boolean;
                        lookupNamespaceURI(prefix: string | null): string | null;
                        lookupPrefix(namespace: string | null): string | null;
                        normalize(): void;
                        removeChild<T extends Node>(oldChild: T): T;
                        replaceChild<T extends Node>(newChild: Node, oldChild: T): T;
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
                        readonly childElementCount: number;
                        readonly children: HTMLCollection;
                        readonly firstElementChild: Element | null;
                        readonly lastElementChild: Element | null;
                        append(...nodes: (string | Node)[]): void;
                        prepend(...nodes: (string | Node)[]): void;
                        querySelector<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): HTMLElementTagNameMap[K] | null;
                        querySelector<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): SVGElementTagNameMap[K] | null;
                        querySelector<E extends Element = Element>(selectors: string): E | null;
                        querySelectorAll<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
                        querySelectorAll<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
                        querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
                        readonly nextElementSibling: Element | null;
                        readonly previousElementSibling: Element | null;
                        after(...nodes: (string | Node)[]): void;
                        before(...nodes: (string | Node)[]): void;
                        remove(): void;
                        replaceWith(...nodes: (string | Node)[]): void;
                        innerHTML: string;
                        animate(keyframes: PropertyIndexedKeyframes | Keyframe[] | null, options?: number | KeyframeAnimationOptions | undefined): Animation;
                        getAnimations(): Animation[];
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
                        onloadend: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
                        onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
                        ontouchcancel: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                        ontouchend: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                        ontouchmove: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                        ontouchstart: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                        ontransitioncancel: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                        ontransitionend: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                        ontransitionrun: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                        ontransitionstart: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                        onvolumechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
                        onwaiting: ((this: GlobalEventHandlers, ev: Event) => any) | null;
                        onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null;
                        oncopy: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                        oncut: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                        onpaste: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                        contentEditable: string;
                        inputMode: string;
                        readonly isContentEditable: boolean;
                        readonly dataset: DOMStringMap;
                        nonce?: string | undefined;
                        tabIndex: number;
                        blur(): void;
                        focus(options?: FocusOptions | undefined): void;
                        readonly style: CSSStyleDeclaration;
                    };
                    dependencies?: {
                        define(isDevelopment?: boolean | undefined, isRoot?: boolean | undefined): void;
                    }[] | null | undefined;
                    is: string;
                    define(isDevelopment?: boolean, isRoot?: boolean): void;
                } & Constructor<HTMLElement>, "define" | "is">;
                __hasCustomCSS(): boolean;
                customCSS(): import("./template-fn.js").TemplateFnLike<number> | import("./template-fn.js").TemplateFnLike<number>[];
                readonly root: import("./base.js").ExtendedShadowRoot;
                props: any;
                readonly jsxProps: import("../classes/types.js").JSXDefinition<any, {}>;
                renderToDOM(change?: CHANGE_TYPE): void;
                preRender(): any;
                postRender(): any;
                firstRender(): any;
                connectedCallback(): void;
                ___definerClass: import("./definer.js").DefinerClass;
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
                addEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
                addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
                removeEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
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
                readonly prefix: string | null;
                readonly scrollHeight: number;
                scrollLeft: number;
                scrollTop: number;
                readonly scrollWidth: number;
                readonly shadowRoot: ShadowRoot | null;
                slot: string;
                readonly tagName: string;
                attachShadow(init: ShadowRootInit): ShadowRoot;
                closest<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selector: K): HTMLElementTagNameMap[K] | null;
                closest<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selector: K): SVGElementTagNameMap[K] | null;
                closest(selector: string): Element | null;
                getAttribute(qualifiedName: string): string | null;
                getAttributeNS(namespace: string | null, localName: string): string | null;
                getAttributeNames(): string[];
                getAttributeNode(name: string): Attr | null;
                getAttributeNodeNS(namespaceURI: string, localName: string): Attr | null;
                getBoundingClientRect(): DOMRect | ClientRect;
                getClientRects(): ClientRectList | DOMRectList;
                getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
                getElementsByTagName<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
                getElementsByTagName<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(qualifiedName: K): HTMLCollectionOf<SVGElementTagNameMap[K]>;
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
                readonly ownerDocument: Document | null;
                readonly parentElement: HTMLElement | null;
                readonly parentNode: (Node & ParentNode) | null;
                readonly previousSibling: Node | null;
                textContent: string | null;
                appendChild<T extends Node>(newChild: T): T;
                cloneNode(deep?: boolean | undefined): Node;
                compareDocumentPosition(other: Node): number;
                contains(other: Node | null): boolean;
                getRootNode(options?: GetRootNodeOptions | undefined): Node;
                hasChildNodes(): boolean;
                insertBefore<T extends Node>(newChild: T, refChild: Node | null): T;
                isDefaultNamespace(namespace: string | null): boolean;
                isEqualNode(otherNode: Node | null): boolean;
                isSameNode(otherNode: Node | null): boolean;
                lookupNamespaceURI(prefix: string | null): string | null;
                lookupPrefix(namespace: string | null): string | null;
                normalize(): void;
                removeChild<T extends Node>(oldChild: T): T;
                replaceChild<T extends Node>(newChild: Node, oldChild: T): T;
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
                readonly childElementCount: number;
                readonly children: HTMLCollection;
                readonly firstElementChild: Element | null;
                readonly lastElementChild: Element | null;
                append(...nodes: (string | Node)[]): void;
                prepend(...nodes: (string | Node)[]): void;
                querySelector<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): HTMLElementTagNameMap[K] | null;
                querySelector<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): SVGElementTagNameMap[K] | null;
                querySelector<E extends Element = Element>(selectors: string): E | null;
                querySelectorAll<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
                querySelectorAll<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
                querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
                readonly nextElementSibling: Element | null;
                readonly previousElementSibling: Element | null;
                after(...nodes: (string | Node)[]): void;
                before(...nodes: (string | Node)[]): void;
                remove(): void;
                replaceWith(...nodes: (string | Node)[]): void;
                innerHTML: string;
                animate(keyframes: PropertyIndexedKeyframes | Keyframe[] | null, options?: number | KeyframeAnimationOptions | undefined): Animation;
                getAnimations(): Animation[];
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
                onloadend: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
                onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
                ontouchcancel: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontouchend: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontouchmove: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontouchstart: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontransitioncancel: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                ontransitionend: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                ontransitionrun: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                ontransitionstart: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                onvolumechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
                onwaiting: ((this: GlobalEventHandlers, ev: Event) => any) | null;
                onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null;
                oncopy: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                oncut: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                onpaste: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                contentEditable: string;
                inputMode: string;
                readonly isContentEditable: boolean;
                readonly dataset: DOMStringMap;
                nonce?: string | undefined;
                tabIndex: number;
                blur(): void;
                focus(options?: FocusOptions | undefined): void;
                readonly style: CSSStyleDeclaration;
            }): boolean;
            define: (isDevelopment?: boolean, isRoot?: boolean) => void;
            is: string;
        } & Constructor<Pick<WebComponentDefinerMixinInstance, "___definerClass"> & HTMLElement> & Pick<{
            new (...args: any[]): {
                ___definerClass: import("./definer.js").DefinerClass;
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
                addEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
                addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
                removeEventListener<K extends "waiting" | "error" | "abort" | "cancel" | "progress" | "ended" | "change" | "input" | "select" | "fullscreenchange" | "fullscreenerror" | "animationcancel" | "animationend" | "animationiteration" | "animationstart" | "auxclick" | "blur" | "canplay" | "canplaythrough" | "click" | "close" | "contextmenu" | "cuechange" | "dblclick" | "drag" | "dragend" | "dragenter" | "dragexit" | "dragleave" | "dragover" | "dragstart" | "drop" | "durationchange" | "emptied" | "focus" | "gotpointercapture" | "invalid" | "keydown" | "keypress" | "keyup" | "load" | "loadeddata" | "loadedmetadata" | "loadend" | "loadstart" | "lostpointercapture" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "pause" | "play" | "playing" | "pointercancel" | "pointerdown" | "pointerenter" | "pointerleave" | "pointermove" | "pointerout" | "pointerover" | "pointerup" | "ratechange" | "reset" | "resize" | "scroll" | "securitypolicyviolation" | "seeked" | "seeking" | "selectionchange" | "selectstart" | "stalled" | "submit" | "suspend" | "timeupdate" | "toggle" | "touchcancel" | "touchend" | "touchmove" | "touchstart" | "transitioncancel" | "transitionend" | "transitionrun" | "transitionstart" | "volumechange" | "wheel" | "copy" | "cut" | "paste">(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
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
                readonly prefix: string | null;
                readonly scrollHeight: number;
                scrollLeft: number;
                scrollTop: number;
                readonly scrollWidth: number;
                readonly shadowRoot: ShadowRoot | null;
                slot: string;
                readonly tagName: string;
                attachShadow(init: ShadowRootInit): ShadowRoot;
                closest<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selector: K): HTMLElementTagNameMap[K] | null;
                closest<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selector: K): SVGElementTagNameMap[K] | null;
                closest(selector: string): Element | null;
                getAttribute(qualifiedName: string): string | null;
                getAttributeNS(namespace: string | null, localName: string): string | null;
                getAttributeNames(): string[];
                getAttributeNode(name: string): Attr | null;
                getAttributeNodeNS(namespaceURI: string, localName: string): Attr | null;
                getBoundingClientRect(): DOMRect | ClientRect;
                getClientRects(): ClientRectList | DOMRectList;
                getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
                getElementsByTagName<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
                getElementsByTagName<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(qualifiedName: K): HTMLCollectionOf<SVGElementTagNameMap[K]>;
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
                readonly ownerDocument: Document | null;
                readonly parentElement: HTMLElement | null;
                readonly parentNode: (Node & ParentNode) | null;
                readonly previousSibling: Node | null;
                textContent: string | null;
                appendChild<T extends Node>(newChild: T): T;
                cloneNode(deep?: boolean | undefined): Node;
                compareDocumentPosition(other: Node): number;
                contains(other: Node | null): boolean;
                getRootNode(options?: GetRootNodeOptions | undefined): Node;
                hasChildNodes(): boolean;
                insertBefore<T extends Node>(newChild: T, refChild: Node | null): T;
                isDefaultNamespace(namespace: string | null): boolean;
                isEqualNode(otherNode: Node | null): boolean;
                isSameNode(otherNode: Node | null): boolean;
                lookupNamespaceURI(prefix: string | null): string | null;
                lookupPrefix(namespace: string | null): string | null;
                normalize(): void;
                removeChild<T extends Node>(oldChild: T): T;
                replaceChild<T extends Node>(newChild: Node, oldChild: T): T;
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
                readonly childElementCount: number;
                readonly children: HTMLCollection;
                readonly firstElementChild: Element | null;
                readonly lastElementChild: Element | null;
                append(...nodes: (string | Node)[]): void;
                prepend(...nodes: (string | Node)[]): void;
                querySelector<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): HTMLElementTagNameMap[K] | null;
                querySelector<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): SVGElementTagNameMap[K] | null;
                querySelector<E extends Element = Element>(selectors: string): E | null;
                querySelectorAll<K extends "object" | "link" | "small" | "sub" | "sup" | "track" | "progress" | "a" | "abbr" | "address" | "applet" | "area" | "article" | "aside" | "audio" | "b" | "base" | "basefont" | "bdi" | "bdo" | "blockquote" | "body" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "data" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "dir" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "font" | "footer" | "form" | "frame" | "frameset" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "head" | "header" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "label" | "legend" | "li" | "main" | "map" | "mark" | "marquee" | "menu" | "meta" | "meter" | "nav" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "script" | "section" | "select" | "slot" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "template" | "textarea" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "u" | "ul" | "var" | "video" | "wbr">(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
                querySelectorAll<K extends "symbol" | "a" | "script" | "style" | "title" | "circle" | "clipPath" | "defs" | "desc" | "ellipse" | "feBlend" | "feColorMatrix" | "feComponentTransfer" | "feComposite" | "feConvolveMatrix" | "feDiffuseLighting" | "feDisplacementMap" | "feDistantLight" | "feFlood" | "feFuncA" | "feFuncB" | "feFuncG" | "feFuncR" | "feGaussianBlur" | "feImage" | "feMerge" | "feMergeNode" | "feMorphology" | "feOffset" | "fePointLight" | "feSpecularLighting" | "feSpotLight" | "feTile" | "feTurbulence" | "filter" | "foreignObject" | "g" | "image" | "line" | "linearGradient" | "marker" | "mask" | "metadata" | "path" | "pattern" | "polygon" | "polyline" | "radialGradient" | "rect" | "stop" | "svg" | "switch" | "text" | "textPath" | "tspan" | "use" | "view">(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
                querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
                readonly nextElementSibling: Element | null;
                readonly previousElementSibling: Element | null;
                after(...nodes: (string | Node)[]): void;
                before(...nodes: (string | Node)[]): void;
                remove(): void;
                replaceWith(...nodes: (string | Node)[]): void;
                innerHTML: string;
                animate(keyframes: PropertyIndexedKeyframes | Keyframe[] | null, options?: number | KeyframeAnimationOptions | undefined): Animation;
                getAnimations(): Animation[];
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
                onloadend: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
                onprogress: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null;
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
                ontouchcancel: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontouchend: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontouchmove: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontouchstart: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null;
                ontransitioncancel: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                ontransitionend: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                ontransitionrun: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                ontransitionstart: ((this: GlobalEventHandlers, ev: TransitionEvent) => any) | null;
                onvolumechange: ((this: GlobalEventHandlers, ev: Event) => any) | null;
                onwaiting: ((this: GlobalEventHandlers, ev: Event) => any) | null;
                onwheel: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null;
                oncopy: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                oncut: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                onpaste: ((this: DocumentAndElementEventHandlers, ev: ClipboardEvent) => any) | null;
                contentEditable: string;
                inputMode: string;
                readonly isContentEditable: boolean;
                readonly dataset: DOMStringMap;
                nonce?: string | undefined;
                tabIndex: number;
                blur(): void;
                focus(options?: FocusOptions | undefined): void;
                readonly style: CSSStyleDeclaration;
            };
            dependencies?: {
                define(isDevelopment?: boolean | undefined, isRoot?: boolean | undefined): void;
            }[] | null | undefined;
            is: string;
            define(isDevelopment?: boolean, isRoot?: boolean): void;
        } & Constructor<HTMLElement>, "define" | "is">;
    };
} & P;
//# sourceMappingURL=component.d.ts.map