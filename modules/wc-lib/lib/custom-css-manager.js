import { CUSTOM_CSS_PROP_NAME } from './base.js';
import { TemplateFn } from './template-fn.js';
class CustomCSSClass {
    constructor(_self) {
        this._self = _self;
        this.hasCustomCSS = null;
        this.__noCustomCSS = new TemplateFn(null, 4 /* NEVER */, null);
    }
    getCustomCSS() {
        if (!this._self.__hasCustomCSS()) {
            return this.__noCustomCSS;
        }
        return this._self.getParentRef(this._self.getAttribute(CUSTOM_CSS_PROP_NAME));
    }
}
/**
 * A mixin that, when applied, allows
 * for custom css to be passed to a component
 * after which it will be rendered
 *
 * @template P
 *
 * @param {P} superFn - The parent/super that this mixin extends
 */
export const WebComponentCustomCSSManagerMixin = (superFn) => {
    const privateMap = new WeakMap();
    function customCSSClass(self) {
        if (privateMap.has(self))
            return privateMap.get(self);
        return privateMap.set(self, new CustomCSSClass(self)).get(self);
    }
    /**
     * The class that manages custom CSS
     */
    class WebComponentCustomCSSManager extends superFn {
        constructor(...args) {
            super(...args);
            this.isMounted = false;
            const originalSetAttr = this.setAttribute;
            this.setAttribute = (key, val) => {
                originalSetAttr.bind(this)(key, val);
                if (key === CUSTOM_CSS_PROP_NAME && this.isMounted) {
                    this.renderToDOM(11 /* ALWAYS */);
                }
            };
        }
        __hasCustomCSS() {
            const priv = customCSSClass(this);
            if (priv.hasCustomCSS !== null) {
                return priv.hasCustomCSS;
            }
            if (!this.hasAttribute(CUSTOM_CSS_PROP_NAME) ||
                !this.getParentRef(this.getAttribute(CUSTOM_CSS_PROP_NAME))) {
                //No custom CSS applies
                if (this.isMounted) {
                    priv.hasCustomCSS = false;
                }
                return false;
            }
            return (priv.hasCustomCSS = true);
        }
        customCSS() {
            return customCSSClass(this).getCustomCSS();
        }
    }
    const __typecheck__ = WebComponentCustomCSSManager;
    __typecheck__;
    return WebComponentCustomCSSManager;
};
//# sourceMappingURL=custom-css-manager.js.map