import { WebComponentDefinerTypeInstance, WebComponentDefinerTypeStatic, WebComponentBaseTypeInstance, WebComponentBaseTypeStatic, WebComponentListenableTypeInstance, WebComponentListenableTypeStatic, WebComponentTypeInstance, WebComponentTypeStatic, WebComponentThemeManagerTypeInstance, WebComponentThemeManagerTypeStatic, WebComponentI18NManagerTypeInstance, WebComponentI18NManagerTypeStatic, WebComponentHierarchyManagerTypeInstance, WebComponentHierarchyManagerTypeStatic, WebComponentTemplateManagerTypeInstance, WebComponentTemplateManagerTypeStatic, GetRenderArgsMixin } from './types';
import { EventListenerObj, GetEvents } from '../lib/listener.js';
import { SelectorMap, GetEls } from '../lib/component.js';
import { CHANGE_TYPE } from '../lib/enums.js';
declare const basicWebComponent: {
    new <GA extends {
        events?: EventListenerObj | undefined;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
        themes?: {
            [key: string]: any;
        } | undefined;
        i18n?: any;
        langs?: string | undefined;
        selectors?: SelectorMap | undefined;
        subtreeProps?: {
            [key: string]: any;
        } | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): Pick<HTMLElement & WebComponentDefinerTypeInstance & WebComponentBaseTypeInstance & WebComponentListenableTypeInstance<GA, E> & WebComponentTypeInstance<GA, void, ELS>, "dir" | "slot" | "style" | "title" | "jsxProps" | "listen" | "fire" | "___definerClass" | "props" | "blur" | "click" | "focus" | "scroll" | "renderToDOM" | "root" | "clearListener" | "accessKey" | "accessKeyLabel" | "autocapitalize" | "draggable" | "hidden" | "innerText" | "lang" | "offsetHeight" | "offsetLeft" | "offsetParent" | "offsetTop" | "offsetWidth" | "spellcheck" | "translate" | "addEventListener" | "removeEventListener" | "assignedSlot" | "attributes" | "classList" | "className" | "clientHeight" | "clientLeft" | "clientTop" | "clientWidth" | "id" | "localName" | "namespaceURI" | "onfullscreenchange" | "onfullscreenerror" | "outerHTML" | "ownerDocument" | "prefix" | "scrollHeight" | "scrollLeft" | "scrollTop" | "scrollWidth" | "shadowRoot" | "tagName" | "attachShadow" | "closest" | "getAttribute" | "getAttributeNS" | "getAttributeNames" | "getAttributeNode" | "getAttributeNodeNS" | "getBoundingClientRect" | "getClientRects" | "getElementsByClassName" | "getElementsByTagName" | "getElementsByTagNameNS" | "hasAttribute" | "hasAttributeNS" | "hasAttributes" | "hasPointerCapture" | "insertAdjacentElement" | "insertAdjacentHTML" | "insertAdjacentText" | "matches" | "msGetRegionContent" | "releasePointerCapture" | "removeAttribute" | "removeAttributeNS" | "removeAttributeNode" | "requestFullscreen" | "requestPointerLock" | "scrollBy" | "scrollIntoView" | "scrollTo" | "setAttribute" | "setAttributeNS" | "setAttributeNode" | "setAttributeNodeNS" | "setPointerCapture" | "toggleAttribute" | "webkitMatchesSelector" | "baseURI" | "childNodes" | "firstChild" | "isConnected" | "lastChild" | "nextSibling" | "nodeName" | "nodeType" | "nodeValue" | "parentElement" | "parentNode" | "previousSibling" | "textContent" | "appendChild" | "cloneNode" | "compareDocumentPosition" | "contains" | "getRootNode" | "hasChildNodes" | "insertBefore" | "isDefaultNamespace" | "isEqualNode" | "isSameNode" | "lookupNamespaceURI" | "lookupPrefix" | "normalize" | "removeChild" | "replaceChild" | "ATTRIBUTE_NODE" | "CDATA_SECTION_NODE" | "COMMENT_NODE" | "DOCUMENT_FRAGMENT_NODE" | "DOCUMENT_NODE" | "DOCUMENT_POSITION_CONTAINED_BY" | "DOCUMENT_POSITION_CONTAINS" | "DOCUMENT_POSITION_DISCONNECTED" | "DOCUMENT_POSITION_FOLLOWING" | "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC" | "DOCUMENT_POSITION_PRECEDING" | "DOCUMENT_TYPE_NODE" | "ELEMENT_NODE" | "ENTITY_NODE" | "ENTITY_REFERENCE_NODE" | "NOTATION_NODE" | "PROCESSING_INSTRUCTION_NODE" | "TEXT_NODE" | "dispatchEvent" | "animate" | "getAnimations" | "after" | "before" | "remove" | "replaceWith" | "innerHTML" | "nextElementSibling" | "previousElementSibling" | "childElementCount" | "children" | "firstElementChild" | "lastElementChild" | "append" | "prepend" | "querySelector" | "querySelectorAll" | "oncopy" | "oncut" | "onpaste" | "contentEditable" | "enterKeyHint" | "inputMode" | "isContentEditable" | "onabort" | "onanimationcancel" | "onanimationend" | "onanimationiteration" | "onanimationstart" | "onauxclick" | "onblur" | "oncancel" | "oncanplay" | "oncanplaythrough" | "onchange" | "onclick" | "onclose" | "oncontextmenu" | "oncuechange" | "ondblclick" | "ondrag" | "ondragend" | "ondragenter" | "ondragexit" | "ondragleave" | "ondragover" | "ondragstart" | "ondrop" | "ondurationchange" | "onemptied" | "onended" | "onerror" | "onfocus" | "ongotpointercapture" | "oninput" | "oninvalid" | "onkeydown" | "onkeypress" | "onkeyup" | "onload" | "onloadeddata" | "onloadedmetadata" | "onloadstart" | "onlostpointercapture" | "onmousedown" | "onmouseenter" | "onmouseleave" | "onmousemove" | "onmouseout" | "onmouseover" | "onmouseup" | "onpause" | "onplay" | "onplaying" | "onpointercancel" | "onpointerdown" | "onpointerenter" | "onpointerleave" | "onpointermove" | "onpointerout" | "onpointerover" | "onpointerup" | "onprogress" | "onratechange" | "onreset" | "onresize" | "onscroll" | "onsecuritypolicyviolation" | "onseeked" | "onseeking" | "onselect" | "onselectionchange" | "onselectstart" | "onstalled" | "onsubmit" | "onsuspend" | "ontimeupdate" | "ontoggle" | "ontouchcancel" | "ontouchend" | "ontouchmove" | "ontouchstart" | "ontransitioncancel" | "ontransitionend" | "ontransitionrun" | "ontransitionstart" | "onvolumechange" | "onwaiting" | "onwheel" | "autofocus" | "dataset" | "nonce" | "tabIndex" | "__hasCustomCSS" | "customCSS" | "preRender" | "postRender" | "firstRender" | "connectedCallback" | "$" | "listenerMap" | "disposables" | "isMounted" | "isSSR" | "$$" | "disconnectedCallback" | "layoutMounted" | "mounted" | "unmounted" | "listenProp"> & {
        getRenderArgs(changeType: CHANGE_TYPE | number): {};
    };
    self(): WebComponentDefinerTypeStatic & WebComponentBaseTypeStatic & WebComponentListenableTypeStatic & WebComponentTypeStatic;
} & Pick<typeof WebComponentDefinerTypeInstance, "is" | "dependencies" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentTypeInstance, never>;
/**
 * A component that only uses the most basic parts
 * Uses the `definer`, `renderer` and `listeners`
 */
export declare class BasicWebComponent<GA extends {
    i18n?: any;
    langs?: string;
    events?: EventListenerObj;
    selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends basicWebComponent<GA, E, ELS> {
    getRenderArgs<CT extends CHANGE_TYPE | number>(changeType: CT): GetRenderArgsMixin<this>;
}
declare const themingWebComponent: {
    new <GA extends {
        events?: EventListenerObj | undefined;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
        themes?: {
            [key: string]: any;
        } | undefined;
        i18n?: any;
        langs?: string | undefined;
        selectors?: SelectorMap | undefined;
        subtreeProps?: {
            [key: string]: any;
        } | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): Pick<HTMLElement & WebComponentDefinerTypeInstance & WebComponentBaseTypeInstance & WebComponentListenableTypeInstance<GA, E> & WebComponentThemeManagerTypeInstance<GA> & WebComponentTypeInstance<GA, void, ELS>, "dir" | "slot" | "style" | "title" | "jsxProps" | "listen" | "fire" | "___definerClass" | "props" | "blur" | "click" | "focus" | "scroll" | "renderToDOM" | "root" | "clearListener" | "accessKey" | "accessKeyLabel" | "autocapitalize" | "draggable" | "hidden" | "innerText" | "lang" | "offsetHeight" | "offsetLeft" | "offsetParent" | "offsetTop" | "offsetWidth" | "spellcheck" | "translate" | "addEventListener" | "removeEventListener" | "assignedSlot" | "attributes" | "classList" | "className" | "clientHeight" | "clientLeft" | "clientTop" | "clientWidth" | "id" | "localName" | "namespaceURI" | "onfullscreenchange" | "onfullscreenerror" | "outerHTML" | "ownerDocument" | "prefix" | "scrollHeight" | "scrollLeft" | "scrollTop" | "scrollWidth" | "shadowRoot" | "tagName" | "attachShadow" | "closest" | "getAttribute" | "getAttributeNS" | "getAttributeNames" | "getAttributeNode" | "getAttributeNodeNS" | "getBoundingClientRect" | "getClientRects" | "getElementsByClassName" | "getElementsByTagName" | "getElementsByTagNameNS" | "hasAttribute" | "hasAttributeNS" | "hasAttributes" | "hasPointerCapture" | "insertAdjacentElement" | "insertAdjacentHTML" | "insertAdjacentText" | "matches" | "msGetRegionContent" | "releasePointerCapture" | "removeAttribute" | "removeAttributeNS" | "removeAttributeNode" | "requestFullscreen" | "requestPointerLock" | "scrollBy" | "scrollIntoView" | "scrollTo" | "setAttribute" | "setAttributeNS" | "setAttributeNode" | "setAttributeNodeNS" | "setPointerCapture" | "toggleAttribute" | "webkitMatchesSelector" | "baseURI" | "childNodes" | "firstChild" | "isConnected" | "lastChild" | "nextSibling" | "nodeName" | "nodeType" | "nodeValue" | "parentElement" | "parentNode" | "previousSibling" | "textContent" | "appendChild" | "cloneNode" | "compareDocumentPosition" | "contains" | "getRootNode" | "hasChildNodes" | "insertBefore" | "isDefaultNamespace" | "isEqualNode" | "isSameNode" | "lookupNamespaceURI" | "lookupPrefix" | "normalize" | "removeChild" | "replaceChild" | "ATTRIBUTE_NODE" | "CDATA_SECTION_NODE" | "COMMENT_NODE" | "DOCUMENT_FRAGMENT_NODE" | "DOCUMENT_NODE" | "DOCUMENT_POSITION_CONTAINED_BY" | "DOCUMENT_POSITION_CONTAINS" | "DOCUMENT_POSITION_DISCONNECTED" | "DOCUMENT_POSITION_FOLLOWING" | "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC" | "DOCUMENT_POSITION_PRECEDING" | "DOCUMENT_TYPE_NODE" | "ELEMENT_NODE" | "ENTITY_NODE" | "ENTITY_REFERENCE_NODE" | "NOTATION_NODE" | "PROCESSING_INSTRUCTION_NODE" | "TEXT_NODE" | "dispatchEvent" | "animate" | "getAnimations" | "after" | "before" | "remove" | "replaceWith" | "innerHTML" | "nextElementSibling" | "previousElementSibling" | "childElementCount" | "children" | "firstElementChild" | "lastElementChild" | "append" | "prepend" | "querySelector" | "querySelectorAll" | "oncopy" | "oncut" | "onpaste" | "contentEditable" | "enterKeyHint" | "inputMode" | "isContentEditable" | "onabort" | "onanimationcancel" | "onanimationend" | "onanimationiteration" | "onanimationstart" | "onauxclick" | "onblur" | "oncancel" | "oncanplay" | "oncanplaythrough" | "onchange" | "onclick" | "onclose" | "oncontextmenu" | "oncuechange" | "ondblclick" | "ondrag" | "ondragend" | "ondragenter" | "ondragexit" | "ondragleave" | "ondragover" | "ondragstart" | "ondrop" | "ondurationchange" | "onemptied" | "onended" | "onerror" | "onfocus" | "ongotpointercapture" | "oninput" | "oninvalid" | "onkeydown" | "onkeypress" | "onkeyup" | "onload" | "onloadeddata" | "onloadedmetadata" | "onloadstart" | "onlostpointercapture" | "onmousedown" | "onmouseenter" | "onmouseleave" | "onmousemove" | "onmouseout" | "onmouseover" | "onmouseup" | "onpause" | "onplay" | "onplaying" | "onpointercancel" | "onpointerdown" | "onpointerenter" | "onpointerleave" | "onpointermove" | "onpointerout" | "onpointerover" | "onpointerup" | "onprogress" | "onratechange" | "onreset" | "onresize" | "onscroll" | "onsecuritypolicyviolation" | "onseeked" | "onseeking" | "onselect" | "onselectionchange" | "onselectstart" | "onstalled" | "onsubmit" | "onsuspend" | "ontimeupdate" | "ontoggle" | "ontouchcancel" | "ontouchend" | "ontouchmove" | "ontouchstart" | "ontransitioncancel" | "ontransitionend" | "ontransitionrun" | "ontransitionstart" | "onvolumechange" | "onwaiting" | "onwheel" | "autofocus" | "dataset" | "nonce" | "tabIndex" | "__hasCustomCSS" | "customCSS" | "preRender" | "postRender" | "firstRender" | "connectedCallback" | "getTheme" | "$" | "listenerMap" | "disposables" | "isMounted" | "isSSR" | "$$" | "disconnectedCallback" | "layoutMounted" | "mounted" | "unmounted" | "listenProp" | "getThemeName" | "setTheme"> & {
        getRenderArgs(changeType: CHANGE_TYPE | number): {};
    };
    self(): WebComponentDefinerTypeStatic & WebComponentBaseTypeStatic & WebComponentListenableTypeStatic & WebComponentThemeManagerTypeStatic & WebComponentTypeStatic;
} & Pick<typeof WebComponentDefinerTypeInstance, "is" | "dependencies" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentThemeManagerTypeInstance, "__constructedCSSChanged" | "initTheme" | "setDefaultTheme"> & Pick<typeof WebComponentTypeInstance, never>;
/**
 * A component that uses the basic parts combined
 * with the theming part.
 * Uses the `theming`,
 * `definer`, `renderer` and `listeners`
 */
export declare class ThemingWebComponent<GA extends {
    i18n?: any;
    langs?: string;
    events?: EventListenerObj;
    themes?: {
        [key: string]: any;
    };
    selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends themingWebComponent<GA, E, ELS> {
    getRenderArgs<CT extends CHANGE_TYPE | number>(changeType: CT): GetRenderArgsMixin<this>;
}
declare const i18NWebComponent: {
    new <GA extends {
        events?: EventListenerObj | undefined;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
        themes?: {
            [key: string]: any;
        } | undefined;
        i18n?: any;
        langs?: string | undefined;
        selectors?: SelectorMap | undefined;
        subtreeProps?: {
            [key: string]: any;
        } | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): Pick<HTMLElement & WebComponentDefinerTypeInstance & WebComponentBaseTypeInstance & WebComponentListenableTypeInstance<GA, E> & WebComponentI18NManagerTypeInstance<GA> & WebComponentTypeInstance<GA, void, ELS>, "dir" | "slot" | "style" | "title" | "jsxProps" | "__prom" | "__" | "listen" | "fire" | "___definerClass" | "props" | "blur" | "click" | "focus" | "scroll" | "renderToDOM" | "root" | "clearListener" | "accessKey" | "accessKeyLabel" | "autocapitalize" | "draggable" | "hidden" | "innerText" | "lang" | "offsetHeight" | "offsetLeft" | "offsetParent" | "offsetTop" | "offsetWidth" | "spellcheck" | "translate" | "addEventListener" | "removeEventListener" | "assignedSlot" | "attributes" | "classList" | "className" | "clientHeight" | "clientLeft" | "clientTop" | "clientWidth" | "id" | "localName" | "namespaceURI" | "onfullscreenchange" | "onfullscreenerror" | "outerHTML" | "ownerDocument" | "prefix" | "scrollHeight" | "scrollLeft" | "scrollTop" | "scrollWidth" | "shadowRoot" | "tagName" | "attachShadow" | "closest" | "getAttribute" | "getAttributeNS" | "getAttributeNames" | "getAttributeNode" | "getAttributeNodeNS" | "getBoundingClientRect" | "getClientRects" | "getElementsByClassName" | "getElementsByTagName" | "getElementsByTagNameNS" | "hasAttribute" | "hasAttributeNS" | "hasAttributes" | "hasPointerCapture" | "insertAdjacentElement" | "insertAdjacentHTML" | "insertAdjacentText" | "matches" | "msGetRegionContent" | "releasePointerCapture" | "removeAttribute" | "removeAttributeNS" | "removeAttributeNode" | "requestFullscreen" | "requestPointerLock" | "scrollBy" | "scrollIntoView" | "scrollTo" | "setAttribute" | "setAttributeNS" | "setAttributeNode" | "setAttributeNodeNS" | "setPointerCapture" | "toggleAttribute" | "webkitMatchesSelector" | "baseURI" | "childNodes" | "firstChild" | "isConnected" | "lastChild" | "nextSibling" | "nodeName" | "nodeType" | "nodeValue" | "parentElement" | "parentNode" | "previousSibling" | "textContent" | "appendChild" | "cloneNode" | "compareDocumentPosition" | "contains" | "getRootNode" | "hasChildNodes" | "insertBefore" | "isDefaultNamespace" | "isEqualNode" | "isSameNode" | "lookupNamespaceURI" | "lookupPrefix" | "normalize" | "removeChild" | "replaceChild" | "ATTRIBUTE_NODE" | "CDATA_SECTION_NODE" | "COMMENT_NODE" | "DOCUMENT_FRAGMENT_NODE" | "DOCUMENT_NODE" | "DOCUMENT_POSITION_CONTAINED_BY" | "DOCUMENT_POSITION_CONTAINS" | "DOCUMENT_POSITION_DISCONNECTED" | "DOCUMENT_POSITION_FOLLOWING" | "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC" | "DOCUMENT_POSITION_PRECEDING" | "DOCUMENT_TYPE_NODE" | "ELEMENT_NODE" | "ENTITY_NODE" | "ENTITY_REFERENCE_NODE" | "NOTATION_NODE" | "PROCESSING_INSTRUCTION_NODE" | "TEXT_NODE" | "dispatchEvent" | "animate" | "getAnimations" | "after" | "before" | "remove" | "replaceWith" | "innerHTML" | "nextElementSibling" | "previousElementSibling" | "childElementCount" | "children" | "firstElementChild" | "lastElementChild" | "append" | "prepend" | "querySelector" | "querySelectorAll" | "oncopy" | "oncut" | "onpaste" | "contentEditable" | "enterKeyHint" | "inputMode" | "isContentEditable" | "onabort" | "onanimationcancel" | "onanimationend" | "onanimationiteration" | "onanimationstart" | "onauxclick" | "onblur" | "oncancel" | "oncanplay" | "oncanplaythrough" | "onchange" | "onclick" | "onclose" | "oncontextmenu" | "oncuechange" | "ondblclick" | "ondrag" | "ondragend" | "ondragenter" | "ondragexit" | "ondragleave" | "ondragover" | "ondragstart" | "ondrop" | "ondurationchange" | "onemptied" | "onended" | "onerror" | "onfocus" | "ongotpointercapture" | "oninput" | "oninvalid" | "onkeydown" | "onkeypress" | "onkeyup" | "onload" | "onloadeddata" | "onloadedmetadata" | "onloadstart" | "onlostpointercapture" | "onmousedown" | "onmouseenter" | "onmouseleave" | "onmousemove" | "onmouseout" | "onmouseover" | "onmouseup" | "onpause" | "onplay" | "onplaying" | "onpointercancel" | "onpointerdown" | "onpointerenter" | "onpointerleave" | "onpointermove" | "onpointerout" | "onpointerover" | "onpointerup" | "onprogress" | "onratechange" | "onreset" | "onresize" | "onscroll" | "onsecuritypolicyviolation" | "onseeked" | "onseeking" | "onselect" | "onselectionchange" | "onselectstart" | "onstalled" | "onsubmit" | "onsuspend" | "ontimeupdate" | "ontoggle" | "ontouchcancel" | "ontouchend" | "ontouchmove" | "ontouchstart" | "ontransitioncancel" | "ontransitionend" | "ontransitionrun" | "ontransitionstart" | "onvolumechange" | "onwaiting" | "onwheel" | "autofocus" | "dataset" | "nonce" | "tabIndex" | "__hasCustomCSS" | "customCSS" | "preRender" | "postRender" | "firstRender" | "connectedCallback" | "$" | "listenerMap" | "disposables" | "isMounted" | "isSSR" | "$$" | "disconnectedCallback" | "layoutMounted" | "mounted" | "unmounted" | "listenProp" | "setLang" | "getLang"> & {
        getRenderArgs(changeType: CHANGE_TYPE | number): {};
    };
    self(): WebComponentDefinerTypeStatic & WebComponentBaseTypeStatic & WebComponentListenableTypeStatic & WebComponentI18NManagerTypeStatic & WebComponentTypeStatic;
} & Pick<typeof WebComponentDefinerTypeInstance, "is" | "dependencies" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentI18NManagerTypeInstance, "initI18N" | "__prom" | "__" | "langReady"> & Pick<typeof WebComponentTypeInstance, never>;
/**
 * A component that uses the basic parts combined
 * with the I18N part.
 * Uses the `i18n`,
 * `definer`, `renderer` and `listeners`
 */
export declare class I18NWebComponent<GA extends {
    i18n?: any;
    langs?: string;
    events?: EventListenerObj;
    themes?: {
        [key: string]: any;
    };
    selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends i18NWebComponent<GA, E, ELS> {
    getRenderArgs<CT extends CHANGE_TYPE | number>(changeType: CT): GetRenderArgsMixin<this>;
}
declare const complexTemplatingWebComponent: {
    new <GA extends {
        events?: EventListenerObj | undefined;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
        themes?: {
            [key: string]: any;
        } | undefined;
        i18n?: any;
        langs?: string | undefined;
        selectors?: SelectorMap | undefined;
        subtreeProps?: {
            [key: string]: any;
        } | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): Pick<HTMLElement & WebComponentDefinerTypeInstance & WebComponentBaseTypeInstance & WebComponentListenableTypeInstance<GA, E> & WebComponentHierarchyManagerTypeInstance<GA> & WebComponentTemplateManagerTypeInstance & WebComponentTypeInstance<GA, void, ELS>, "dir" | "slot" | "style" | "title" | "jsxProps" | "listen" | "fire" | "___definerClass" | "props" | "blur" | "click" | "focus" | "scroll" | "renderToDOM" | "globalProps" | "root" | "getParent" | "clearListener" | "generateHTMLTemplate" | "getRef" | "getParentRef" | "genRef" | "accessKey" | "accessKeyLabel" | "autocapitalize" | "draggable" | "hidden" | "innerText" | "lang" | "offsetHeight" | "offsetLeft" | "offsetParent" | "offsetTop" | "offsetWidth" | "spellcheck" | "translate" | "addEventListener" | "removeEventListener" | "assignedSlot" | "attributes" | "classList" | "className" | "clientHeight" | "clientLeft" | "clientTop" | "clientWidth" | "id" | "localName" | "namespaceURI" | "onfullscreenchange" | "onfullscreenerror" | "outerHTML" | "ownerDocument" | "prefix" | "scrollHeight" | "scrollLeft" | "scrollTop" | "scrollWidth" | "shadowRoot" | "tagName" | "attachShadow" | "closest" | "getAttribute" | "getAttributeNS" | "getAttributeNames" | "getAttributeNode" | "getAttributeNodeNS" | "getBoundingClientRect" | "getClientRects" | "getElementsByClassName" | "getElementsByTagName" | "getElementsByTagNameNS" | "hasAttribute" | "hasAttributeNS" | "hasAttributes" | "hasPointerCapture" | "insertAdjacentElement" | "insertAdjacentHTML" | "insertAdjacentText" | "matches" | "msGetRegionContent" | "releasePointerCapture" | "removeAttribute" | "removeAttributeNS" | "removeAttributeNode" | "requestFullscreen" | "requestPointerLock" | "scrollBy" | "scrollIntoView" | "scrollTo" | "setAttribute" | "setAttributeNS" | "setAttributeNode" | "setAttributeNodeNS" | "setPointerCapture" | "toggleAttribute" | "webkitMatchesSelector" | "baseURI" | "childNodes" | "firstChild" | "isConnected" | "lastChild" | "nextSibling" | "nodeName" | "nodeType" | "nodeValue" | "parentElement" | "parentNode" | "previousSibling" | "textContent" | "appendChild" | "cloneNode" | "compareDocumentPosition" | "contains" | "getRootNode" | "hasChildNodes" | "insertBefore" | "isDefaultNamespace" | "isEqualNode" | "isSameNode" | "lookupNamespaceURI" | "lookupPrefix" | "normalize" | "removeChild" | "replaceChild" | "ATTRIBUTE_NODE" | "CDATA_SECTION_NODE" | "COMMENT_NODE" | "DOCUMENT_FRAGMENT_NODE" | "DOCUMENT_NODE" | "DOCUMENT_POSITION_CONTAINED_BY" | "DOCUMENT_POSITION_CONTAINS" | "DOCUMENT_POSITION_DISCONNECTED" | "DOCUMENT_POSITION_FOLLOWING" | "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC" | "DOCUMENT_POSITION_PRECEDING" | "DOCUMENT_TYPE_NODE" | "ELEMENT_NODE" | "ENTITY_NODE" | "ENTITY_REFERENCE_NODE" | "NOTATION_NODE" | "PROCESSING_INSTRUCTION_NODE" | "TEXT_NODE" | "dispatchEvent" | "animate" | "getAnimations" | "after" | "before" | "remove" | "replaceWith" | "innerHTML" | "nextElementSibling" | "previousElementSibling" | "childElementCount" | "children" | "firstElementChild" | "lastElementChild" | "append" | "prepend" | "querySelector" | "querySelectorAll" | "oncopy" | "oncut" | "onpaste" | "contentEditable" | "enterKeyHint" | "inputMode" | "isContentEditable" | "onabort" | "onanimationcancel" | "onanimationend" | "onanimationiteration" | "onanimationstart" | "onauxclick" | "onblur" | "oncancel" | "oncanplay" | "oncanplaythrough" | "onchange" | "onclick" | "onclose" | "oncontextmenu" | "oncuechange" | "ondblclick" | "ondrag" | "ondragend" | "ondragenter" | "ondragexit" | "ondragleave" | "ondragover" | "ondragstart" | "ondrop" | "ondurationchange" | "onemptied" | "onended" | "onerror" | "onfocus" | "ongotpointercapture" | "oninput" | "oninvalid" | "onkeydown" | "onkeypress" | "onkeyup" | "onload" | "onloadeddata" | "onloadedmetadata" | "onloadstart" | "onlostpointercapture" | "onmousedown" | "onmouseenter" | "onmouseleave" | "onmousemove" | "onmouseout" | "onmouseover" | "onmouseup" | "onpause" | "onplay" | "onplaying" | "onpointercancel" | "onpointerdown" | "onpointerenter" | "onpointerleave" | "onpointermove" | "onpointerout" | "onpointerover" | "onpointerup" | "onprogress" | "onratechange" | "onreset" | "onresize" | "onscroll" | "onsecuritypolicyviolation" | "onseeked" | "onseeking" | "onselect" | "onselectionchange" | "onselectstart" | "onstalled" | "onsubmit" | "onsuspend" | "ontimeupdate" | "ontoggle" | "ontouchcancel" | "ontouchend" | "ontouchmove" | "ontouchstart" | "ontransitioncancel" | "ontransitionend" | "ontransitionrun" | "ontransitionstart" | "onvolumechange" | "onwaiting" | "onwheel" | "autofocus" | "dataset" | "nonce" | "tabIndex" | "__hasCustomCSS" | "customCSS" | "preRender" | "postRender" | "firstRender" | "connectedCallback" | "listenGP" | "registerChild" | "registerAsSubTreeRoot" | "setSubTreeProps" | "getSubtreeRoots" | "getSubTreeProps" | "getRoot" | "runGlobalFunction" | "$" | "listenerMap" | "disposables" | "isMounted" | "isSSR" | "$$" | "disconnectedCallback" | "layoutMounted" | "mounted" | "unmounted" | "listenProp"> & {
        getRenderArgs(changeType: CHANGE_TYPE | number): {};
    };
    self(): WebComponentDefinerTypeStatic & WebComponentBaseTypeStatic & WebComponentListenableTypeStatic & WebComponentHierarchyManagerTypeStatic & WebComponentTemplateManagerTypeStatic & WebComponentTypeStatic;
} & Pick<typeof WebComponentDefinerTypeInstance, "is" | "dependencies" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentHierarchyManagerTypeInstance, never> & Pick<typeof WebComponentTemplateManagerTypeInstance, "initComplexTemplateProvider"> & Pick<typeof WebComponentTypeInstance, never>;
/**
 * A component that uses the basic parts combined
 * with the hierarchy manager.
 * Uses the `hierarchy`,
 * `definer`, `renderer` and `listeners`
 */
export declare class ComplexTemplatingWebComponent<GA extends {
    i18n?: any;
    langs?: string;
    events?: EventListenerObj;
    selectors?: SelectorMap;
    root?: any;
    parent?: any;
    globalProps?: {
        [key: string]: any;
    };
    subtreeProps?: {
        [key: string]: any;
    };
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends complexTemplatingWebComponent<GA, E, ELS> {
    getRenderArgs<CT extends CHANGE_TYPE | number>(changeType: CT): GetRenderArgsMixin<this>;
}
export {};
//# sourceMappingURL=partial.d.ts.map