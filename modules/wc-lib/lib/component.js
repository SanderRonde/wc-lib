var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { bindToClass } from './base.js';
import { Listeners } from './listeners.js';
import { WCLibError } from './shared.js';
import { Props } from './props.js';
class ComponentClass {
    constructor() {
        /**
         * An ID map containing maps between queried IDs and elements,
         * 	cleared upon render
         */
        this.idMap = new Map();
        this.idMapProxy = null;
        this.supportsProxy = typeof Proxy !== 'undefined';
    }
    clearMap() {
        this.idMap.clear();
    }
    genIdMapProxy(self) {
        const __this = this;
        return new Proxy((selector) => {
            return self.root.querySelector(selector);
        }, {
            get(_, id) {
                if (typeof id !== 'string') {
                    return undefined;
                }
                const cached = __this.idMap.get(id);
                if (cached && self.shadowRoot.contains(cached)) {
                    return cached;
                }
                const el = self.root.getElementById(id);
                if (el) {
                    __this.idMap.set(id, el);
                }
                return el || undefined;
            },
        });
    }
    getIdMapSnapshot(self) {
        const snapshot = ((selector) => {
            return self.root.querySelector(selector);
        });
        for (const item of self.root.querySelectorAll('[id]')) {
            snapshot[item.id] = item;
        }
        return snapshot;
    }
}
__decorate([
    bindToClass
], ComponentClass.prototype, "clearMap", null);
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
export const WebComponentMixin = (superFn) => {
    const privateMap = new WeakMap();
    function getPrivate(self) {
        if (privateMap.has(self))
            return privateMap.get(self);
        return privateMap.set(self, new ComponentClass()).get(self);
    }
    // Will show a warning regarding using generics in mixins
    // This issue is tracked in the typescript repo's issues with numbers
    // #26154 #24122 (among others)
    //@ts-ignore
    class WebComponent extends superFn {
        constructor(...args) {
            super(...args);
            this.disposables = [];
            this.isMounted = false;
            this.___definerClass.internals.postRenderHooks.push(getPrivate(this).clearMap);
        }
        get isSSR() {
            return false;
        }
        get $() {
            const priv = getPrivate(this);
            if (priv.supportsProxy) {
                return (priv.idMapProxy ||
                    (priv.idMapProxy = priv.genIdMapProxy(this)));
            }
            // Re-generate the ID map every time
            return priv.getIdMapSnapshot(this);
        }
        $$(selector) {
            return [...this.root.querySelectorAll(selector)];
        }
        connectedCallback() {
            super.connectedCallback();
            if (!this.self) {
                throw new WCLibError(this, 'Missing .self property on component');
            }
            Props.onConnect(this);
            this.renderToDOM(63 /* ALWAYS */);
            this.layoutMounted();
            this.___definerClass.internals.connectedHooks.filter((fn) => fn());
        }
        disconnectedCallback() {
            /* istanbul ignore next */
            super.disconnectedCallback && super.disconnectedCallback();
            Listeners.removeAllElementListeners(this);
            this.disposables.forEach((disposable) => disposable());
            this.disposables = [];
            this.isMounted = false;
            this.unmounted();
        }
        layoutMounted() { }
        mounted() { }
        unmounted() { }
        listenProp(event, listener, once = false) {
            this.listen(event, listener, once);
        }
    }
    const __typecheck__ = WebComponent;
    __typecheck__;
    return WebComponent;
};
//# sourceMappingURL=component.js.map