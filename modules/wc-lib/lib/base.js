var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
    if (!descriptor || (typeof descriptor.value !== 'function')) {
        throw new TypeError(`Only methods can be decorated with @bind. <${propertyKey}> is not a method!`);
    }
    return {
        configurable: true,
        get() {
            const bound = descriptor.value.bind(this);
            Object.defineProperty(this, propertyKey, {
                value: bound,
                configurable: true,
                writable: true
            });
            return bound;
        }
    };
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
        if (this.instance.___cssArr !== null)
            return this.instance.___cssArr;
        return (this.instance.___cssArr =
            makeArray(this._self.self.css || []));
    }
    ;
    get __privateCSS() {
        if (this.instance.___privateCSS !== null)
            return this.instance.___privateCSS;
        return (this.instance.___privateCSS =
            /* istanbul ignore next */
            this.canUseConstructedCSS ? this.__cssArr.filter((template) => {
                return !(template.changeOn === 2 /* THEME */ ||
                    template.changeOn & 4 /* NEVER */);
            }) : this.__cssArr);
    }
    ;
    doPreRenderLifecycle() {
        this.disableRender = true;
        const retVal = this._self.preRender();
        this.disableRender = false;
        return retVal;
    }
    doPostRenderLifecycle() {
        this._self.___definerClass.internals.postRenderHooks.forEach(fn => fn());
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
        css.forEach(n => this._self.root.appendChild(n));
        customCSS.forEach(n => this._self.root.appendChild(n));
        this._self.root.appendChild(html);
        return {
            css,
            customCSS,
            html
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
        this.instance.__cssSheets = this.instance.__cssSheets || this.__cssArr
            .filter((template) => {
            return template.changeOn === 2 /* THEME */ ||
                template.changeOn & 4 /* NEVER */;
        }).map(t => ({
            sheet: new CSSStyleSheet(),
            template: t
        }));
    }
    /* istanbul ignore next */
    renderConstructedCSS(change) {
        if (!this.__sheetsMounted) {
            this.__genConstructedCSS();
            // Mount them
            this._self.root.adoptedStyleSheets =
                this.instance.__cssSheets.map(s => s.sheet);
            this.__sheetsMounted = true;
            // Force new render
            change = 11 /* ALWAYS */;
        }
        if (!(change & 2 /* THEME */)) {
            // Only render on theme or everything change
            return;
        }
        // Check if it should render at all
        if (!this._self.self.__constructedCSSChanged(this._self)) {
            return;
        }
        this.instance.__cssSheets.forEach(({ sheet, template }) => {
            const rendered = template.renderAsText(change, this._self).replace(/<\/?style>/g, '');
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
        if (change === 27 /* FORCE */) {
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
            /**
             * The root of this component's DOM
             *
             * @readonly
             */
            this.root = this.attachShadow({
                mode: 'open'
            });
            /**
             * The properties of this component
             *
             * @readonly
             */
            this.props = {};
        }
        /**
         * The element's constructor
         *
         * @readonly
         */
        /* istanbul ignore next */
        get self() {
            return null;
        }
        /**
         * A function signaling whether this component has custom CSS applied to it
         *
         * @returns {boolean} Whether this component uses custom CSS
         */
        /* istanbul ignore next */
        __hasCustomCSS() {
            return false;
        }
        /**
         * Gets this component's custom CSS templates
         *
         * @returns {TemplateFnLike<CHANGE_TYPE>|TemplateFnLike<CHANGE_TYPE>[]} The
         * 	custom CSS templates
         */
        /* istanbul ignore next */
        customCSS() {
            return [];
        }
        /**
         * Checks whether the constructed CSS should be changed. This function can be
         * overridden to allow for a custom checker. Since constructed CSS
         * is shared with all other instances of this specific component,
         * this should only return true if the CSS for all of these components
         * has changed. For example it might change when the theme has changed
         *
         * @param {WebComponentBase} _element - The element for which to
         * 	check it
         *
         * @returns {boolean} Whether the constructed CSS has changed
         */
        /* istanbul ignore next */
        static __constructedCSSChanged(_element) {
            // Assume nothing can be changed then, only do first render
            if (BaseClass.__constructedCSSRendered) {
                return false;
            }
            BaseClass.__constructedCSSRendered = true;
            return true;
        }
        /**
         * The properties of this component but
         * suited to be used as JSX props
         *
         * @readonly
         */
        /* istanbul ignore next */
        get jsxProps() {
            return this.props;
        }
        /**
         * The method that starts the rendering cycle
         *
         * @param {CHANGE_TYPE} [change] The change type. This
         * 	is set to always render if not supplied
         */
        renderToDOM(change = 27 /* FORCE */) {
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
        /**
         * A method called before rendering (changing props won't trigger additional re-render)
         * If false is returned, cancels the render
         *
         * @returns {false|any} The return value, if false, cancels the render
         */
        preRender() { }
        /**
         * A method called after rendering
         */
        postRender() { }
        /**
         * A method called after the very first render
         */
        firstRender() { }
        /**
         * A method called when the component is mounted
         * to the DOM. Be sure to always call
         * `super.connectedCallback` if you
         * override this
         */
        connectedCallback() { }
    }
    __decorate([
        bindToClass
    ], WebComponentBase.prototype, "renderToDOM", null);
    return WebComponentBase;
};
//# sourceMappingURL=base.js.map