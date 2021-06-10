var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { CHANGE_TYPE } from './enums.js';
/**
 * The property name for custom-css
 *
 * @constant
 */
export const CUSTOM_CSS_PROP_NAME = 'custom-css';
function repeat(size) {
    return new Array(size).fill(0);
}
function makeArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    return [value];
}
/**
 * Binds a function to the class, making sure the `this`
 * value always points to the class, even if its container
 * object is changed
 *
 * **Note:** This is a decorator
 *
 * @param {object} _target - The class to bind this to
 * @param {string} propertyKey - The name of this method
 * @param {TypedPropertyDescriptor<T>} descriptor - The
 * 	property descriptor
 *
 * @returns {TypedPropertyDescriptor<T>|void} The new
 * 	property
 */
export function bindToClass(_target, propertyKey, descriptor) {
    if (!descriptor || typeof descriptor.value !== 'function') {
        throw new TypeError(`Only methods can be decorated with @bind. <${propertyKey}> is not a method!`);
    }
    return {
        configurable: true,
        get() {
            const bound = descriptor.value.bind(this);
            Object.defineProperty(this, propertyKey, {
                value: bound,
                configurable: true,
                writable: true,
            });
            return bound;
        },
    };
}
/**
 * Join two objects without accessing their properties,
 * only accessing them when they are accessed in the
 * result object. Basically the same as Object.assign
 * but it preserves getters.
 *
 * @template O1 - The first object
 * @template O2 - The second object
 *
 * @param {O1} objectA - The first object
 * @param {O2} objectB - The second object. Overwrites
 *  the first object's keys when they conflict
 *
 * @returns {O1 & O2} The return object, a joining of
 *  the two
 */
export function assignAsGetter(objectA, objectB, writable = false) {
    const returnObj = {};
    const bKeys = Object.keys(objectB);
    const aKeys = Object.keys(objectA).filter((k) => !bKeys.includes(k));
    for (const aKey of aKeys) {
        Object.defineProperty(returnObj, aKey, Object.assign({
            get() {
                return objectA[aKey];
            },
            enumerable: true,
        }, (writable
            ? {
                set(value) {
                    objectA[aKey] = value;
                },
            }
            : {})));
    }
    for (const bKey of bKeys) {
        Object.defineProperty(returnObj, bKey, Object.assign({
            get() {
                return objectB[bKey];
            },
            enumerable: true,
        }, (writable
            ? {
                set(value) {
                    // istanbul ignore next
                    objectB[bKey] = value;
                },
            }
            : {})));
    }
    return returnObj;
}
class BaseClassElementInstance {
    constructor() {
        this.___cssArr = null;
        this.___privateCSS = null;
        this.__cssSheets = null;
    }
}
const baseClassInstances = new Map();
class BaseClass {
    constructor(_self) {
        this._self = _self;
        /**
         * Whether the render method should be temporarily disabled (to prevent infinite loops)
         */
        this.disableRender = false;
        /**
         * Whether this is the first render
         */
        this.__firstRender = true;
        this.___renderContainers = null;
        this.__sheetsMounted = false;
        this.___canUseConstructedCSS = null;
    }
    get instance() {
        if (baseClassInstances.has(this._self.self.is)) {
            return baseClassInstances.get(this._self.self.is);
        }
        const classInstance = new BaseClassElementInstance();
        baseClassInstances.set(this._self.self.is, classInstance);
        return classInstance;
    }
    get __cssArr() {
        const instance = this.instance;
        if (instance.___cssArr !== null)
            return instance.___cssArr;
        return (instance.___cssArr = makeArray(this._self.self.css || []));
    }
    get __privateCSS() {
        const instance = this.instance;
        if (instance.___privateCSS !== null)
            return instance.___privateCSS;
        return (instance.___privateCSS =
            /* istanbul ignore next */
            this.canUseConstructedCSS
                ? this.__cssArr.filter((template) => {
                    return !(template.changeOn === CHANGE_TYPE.THEME ||
                        template.changeOn === CHANGE_TYPE.NEVER);
                })
                : this.__cssArr);
    }
    doPreRenderLifecycle() {
        this.disableRender = true;
        const retVal = this._self.preRender();
        this.disableRender = false;
        return retVal;
    }
    doPostRenderLifecycle() {
        this._self.___definerClass.internals.postRenderHooks.forEach((fn) => fn());
        if (this.__firstRender) {
            this.__firstRender = false;
            this._self.firstRender();
        }
        this._self.postRender();
    }
    __createFixtures() {
        //Attribute is just for clarity when looking through devtools
        const css = (() => {
            return this.__cssArr.map(() => {
                const el = document.createElement('span');
                el.setAttribute('data-type', 'css');
                return el;
            });
        })();
        const customCSS = (() => {
            if (this._self.__hasCustomCSS()) {
                return repeat(makeArray(this._self.customCSS()).length).map(() => {
                    const el = document.createElement('span');
                    el.setAttribute('data-type', 'custom-css');
                    return el;
                });
            }
            else {
                return [];
            }
        })();
        const html = document.createElement('span');
        html.setAttribute('data-type', 'html');
        css.forEach((n) => this._self.root.appendChild(n));
        customCSS.forEach((n) => this._self.root.appendChild(n));
        this._self.root.appendChild(html);
        return {
            css,
            customCSS,
            html,
        };
    }
    get renderContainers() {
        if (this.___renderContainers) {
            return this.___renderContainers;
        }
        return (this.___renderContainers = this.__createFixtures());
    }
    /* istanbul ignore next */
    __genConstructedCSS() {
        // Create them
        this.instance.__cssSheets =
            this.instance.__cssSheets ||
                this.__cssArr
                    .filter((template) => {
                    return (template.changeOn === CHANGE_TYPE.THEME ||
                        template.changeOn === CHANGE_TYPE.NEVER);
                })
                    .map((t) => ({
                    sheet: new CSSStyleSheet(),
                    template: t,
                }));
    }
    /* istanbul ignore next */
    renderConstructedCSS(change) {
        if (!this.__cssArr.length)
            return;
        if (!this.__sheetsMounted) {
            this.__genConstructedCSS();
            if (this.instance.__cssSheets.length) {
                // Mount them
                this._self.root.adoptedStyleSheets = this.instance.__cssSheets.map((s) => s.sheet);
                this.__sheetsMounted = true;
                // Force new render
                change = CHANGE_TYPE.ALWAYS;
            }
        }
        if (!(change & CHANGE_TYPE.THEME)) {
            // Only render on theme or everything change
            return;
        }
        // Check if it should render at all
        if (!this._self.self.__constructedCSSChanged(this._self)) {
            return;
        }
        this.instance.__cssSheets.forEach(({ sheet, template }) => {
            const rendered = template
                .renderAsText(change, this._self)
                .replace(/<\/?style>/g, '');
            sheet.replaceSync(rendered);
        });
    }
    get canUseConstructedCSS() {
        if (this.___canUseConstructedCSS !== null) {
            return this.___canUseConstructedCSS;
        }
        return (this.___canUseConstructedCSS = (() => {
            try {
                new CSSStyleSheet();
                /* istanbul ignore next */
                return true;
            }
            catch (e) {
                return false;
            }
        })());
    }
    getRenderFn(template, change) {
        if (change === CHANGE_TYPE.FORCE) {
            return template.render.bind(template);
        }
        else {
            return template.renderIfNew.bind(template);
        }
    }
}
BaseClass.__constructedCSSRendered = false;
/**
 * A mixin that will add the ability to do
 * basic rendering of a component
 *
 * @template P - The parent/super class
 *
 * @param {P} superFn - The parent/super to extend
 */
export const WebComponentBaseMixin = (superFn) => {
    const privateMap = new WeakMap();
    function baseClass(self) {
        if (privateMap.has(self))
            return privateMap.get(self);
        return privateMap.set(self, new BaseClass(self)).get(self);
    }
    /**
     * The class that handles basic rendering of a component
     */
    class WebComponentBase extends superFn {
        constructor() {
            super(...arguments);
            this.root = this.attachShadow({
                mode: 'open',
            });
            this.props = {};
        }
        /* istanbul ignore next */
        get self() {
            return null;
        }
        /* istanbul ignore next */
        __hasCustomCSS() {
            return false;
        }
        /* istanbul ignore next */
        customCSS() {
            return [];
        }
        /* istanbul ignore next */
        static __constructedCSSChanged(_element) {
            // Assume nothing can be changed then, only do first render
            if (BaseClass.__constructedCSSRendered) {
                return false;
            }
            BaseClass.__constructedCSSRendered = true;
            return true;
        }
        /* istanbul ignore next */
        get jsxProps() {
            return this.props;
        }
        renderToDOM(change = CHANGE_TYPE.FORCE) {
            const priv = baseClass(this);
            if (priv.disableRender)
                return;
            if (priv.doPreRenderLifecycle() === false) {
                return;
            }
            /* istanbul ignore if */
            if (priv.canUseConstructedCSS) {
                priv.renderConstructedCSS(change);
            }
            priv.__privateCSS.forEach((sheet, index) => {
                priv.getRenderFn(sheet, change)(sheet.renderTemplate(change, this), priv.renderContainers.css[index]);
            });
            if (this.__hasCustomCSS()) {
                makeArray(this.customCSS()).forEach((sheet, index) => {
                    priv.getRenderFn(sheet, change)(sheet.renderTemplate(change, this), priv.renderContainers.customCSS[index]);
                });
            }
            /* istanbul ignore next */
            if (this.self.html) {
                priv.getRenderFn(this.self.html, change)(this.self.html.renderTemplate(change, this), priv.renderContainers.html);
            }
            priv.doPostRenderLifecycle();
        }
        getRenderArgs(changeType) {
            const _this = this;
            return {
                get props() {
                    return _this.props;
                },
                changeType: changeType,
            };
        }
        preRender() { }
        postRender() { }
        firstRender() { }
        connectedCallback() { }
    }
    __decorate([
        bindToClass
    ], WebComponentBase.prototype, "renderToDOM", null);
    const __typecheck__ = WebComponentBase;
    __typecheck__;
    return WebComponentBase;
};
//# sourceMappingURL=base.js.map