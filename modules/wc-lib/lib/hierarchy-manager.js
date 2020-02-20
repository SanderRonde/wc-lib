var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { bindToClass } from './base.js';
class HierarchyClass {
    constructor(_self, _getGetPrivate) {
        this._self = _self;
        this._getGetPrivate = _getGetPrivate;
        this.children = new Set();
        this.parent = null;
        this.globalProperties = {};
        this.globalPropsFns = null;
    }
    __getParent() {
        return this.parent;
    }
    __isHierarchyManagerInstance(element) {
        return HierarchyClass.hierarchyClasses.has(element);
    }
    getGlobalProperties() {
        const props = {};
        for (let i = 0; i < this._self.attributes.length; i++) {
            const attr = this._self.attributes[i];
            if (attr.name.startsWith('prop_')) {
                props[attr.name.slice('prop_'.length)] = decodeURIComponent(attr.value);
            }
        }
        return props;
    }
    __findLocalRoot() {
        let element = this._self.parentNode;
        while (element &&
            !(element instanceof window.ShadowRoot) &&
            element !== document &&
            !(element instanceof DocumentFragment)) {
            element = element.parentNode;
        }
        /* istanbul ignore if */
        if (!element) {
            return null;
        }
        if (element === document) {
            return this._self;
        }
        const host = (() => {
            /* istanbul ignore if */
            if (this.__isHierarchyManagerInstance(element)) {
                return element;
            }
            else {
                return element.host;
            }
        })();
        /* istanbul ignore if */
        if (!this.__isHierarchyManagerInstance(host)) {
            return null;
        }
        return host;
    }
    __findDirectParents() {
        let element = this._self.parentNode;
        while (element &&
            !(element instanceof window.ShadowRoot) &&
            element !== document &&
            !(element instanceof DocumentFragment) &&
            !this.__isHierarchyManagerInstance(element)) {
            element = element.parentNode;
        }
        /* istanbul ignore if */
        if (!element) {
            //Ignore this
            return null;
        }
        /* istanbul ignore else */
        if (element === document) {
            //This is in the light DOM, ignore it since it's the root
            return this._self;
        }
        else {
            const host = this.__isHierarchyManagerInstance(element)
                ? element
                : element.host;
            if (!this.__isHierarchyManagerInstance(host)) {
                return null;
            }
            return host;
        }
    }
    __getRoot() {
        const localRoot = this.__findLocalRoot();
        if (localRoot !== null && localRoot !== this._self) {
            //Found an actual root, use that
            return localRoot;
        }
        return this.__findDirectParents();
    }
    registerToParent() {
        const root = this.__getRoot();
        /* istanbul ignore next */
        if (root === this._self) {
            this.isRoot = true;
            return;
        }
        else if (root === null) {
            return;
        }
        this.parent = root;
        const newProps = Object.assign({}, root.registerChild(this._self));
        for (const key in newProps) {
            this.setGlobalProperty(key, newProps[key]);
        }
    }
    clearNonExistentChildren() {
        const nodeChildren = Array.prototype.slice.apply(this._self.children);
        for (const child of this.children.values()) {
            /* istanbul ignore next */
            if (!this._self.shadowRoot.contains(child) &&
                !nodeChildren.filter((nodeChild) => nodeChild.contains(child))
                    .length) {
                this.children.delete(child);
            }
        }
    }
    setGlobalProperty(key, value) {
        if (this.globalProperties[key] !== value) {
            const oldVal = this.globalProperties[key];
            this.globalProperties[key] = value;
            this._self.fire('globalPropChange', key, value, oldVal);
        }
    }
    propagateThroughTree(fn) {
        /* istanbul ignore else */
        if (this.isRoot) {
            const results = [];
            this.__propagateDown(fn, results);
            return results;
        }
        else if (this.parent) {
            return this._getGetPrivate()(this.parent).propagateThroughTree(fn);
        }
        else {
            return [];
        }
    }
    __propagateDown(fn, results) {
        results.push(fn(this._self));
        for (const child of this.children) {
            this._getGetPrivate()(child).__propagateDown(fn, results);
        }
    }
}
HierarchyClass.hierarchyClasses = new WeakSet();
__decorate([
    bindToClass
], HierarchyClass.prototype, "registerToParent", null);
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
export const WebComponentHierarchyManagerMixin = (superFn) => {
    const privateMap = new WeakMap();
    function hierarchyClass(self) {
        if (privateMap.has(self))
            return privateMap.get(self);
        return privateMap
            .set(self, new HierarchyClass(self, () => hierarchyClass))
            .get(self);
    }
    // Explanation for ts-ignore:
    // Will show a warning regarding using generics in mixins
    // This issue is tracked in the typescript repo's issues with numbers
    // #26154 #24122 (among others)
    /**
     * The class that is responsible for managing
     * the hierarchy of the page, establishing a
     * root node and allowing for global properties
     * to flow from children to the root and back to
     * children
     */
    //@ts-ignore
    class WebComponentHierarchyManager extends superFn {
        constructor(...args) {
            super(...args);
            HierarchyClass.hierarchyClasses.add(this);
        }
        /**
         * Called when the component is mounted to the dom
         */
        connectedCallback() {
            super.connectedCallback();
            const priv = hierarchyClass(this);
            priv.isRoot = this.hasAttribute('_root');
            priv.globalProperties = {};
            priv.registerToParent();
            if (priv.isRoot) {
                priv.globalProperties = Object.assign({}, priv.getGlobalProperties());
            }
        }
        registerChild(element) {
            const priv = hierarchyClass(this);
            priv.clearNonExistentChildren();
            priv.children.add(element);
            return priv.globalProperties;
        }
        globalProps() {
            const priv = hierarchyClass(this);
            if (priv.globalPropsFns) {
                return priv.globalPropsFns;
            }
            const __this = this;
            const fns = {
                get all() {
                    return hierarchyClass(__this).globalProperties;
                },
                get(key) {
                    /* istanbul ignore next */
                    if (!hierarchyClass(__this).globalProperties) {
                        return undefined;
                    }
                    return hierarchyClass(__this).globalProperties[key];
                },
                set(key, value) {
                    /* istanbul ignore if */
                    if (!hierarchyClass(__this).parent &&
                        !hierarchyClass(__this).isRoot) {
                        console.warn(`Failed to propagate global property "${key}" since this element has no registered parent`);
                        return;
                    }
                    hierarchyClass(__this).propagateThroughTree((element) => {
                        hierarchyClass(element).setGlobalProperty(key, value);
                    });
                },
            };
            return (hierarchyClass(this).globalPropsFns = fns);
        }
        getRoot() {
            const priv = hierarchyClass(this);
            if (priv.isRoot) {
                return this;
            }
            return priv.parent.getRoot();
        }
        runGlobalFunction(fn) {
            return hierarchyClass(this).propagateThroughTree(fn);
        }
        getParent() {
            return hierarchyClass(this).__getParent();
        }
        listenGP(event, listener, 
        // istanbul ignore next
        once = false) {
            this.listen(event, listener, once);
        }
    }
    const __typecheck__ = WebComponentHierarchyManager;
    __typecheck__;
    return WebComponentHierarchyManager;
};
//# sourceMappingURL=hierarchy-manager.js.map