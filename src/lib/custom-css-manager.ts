import { WebComponentBaseMixinInstance, CUSTOM_CSS_PROP_NAME } from './base.js';
import { WebComponentTemplateManagerMixinInstance } from './template-manager.js';
import { Constructor, InferInstance, InferReturn } from '../classes/types.js';
import { CHANGE_TYPE, TemplateFn, TemplateFnLike } from './template-fn.js';
import { ClassToObj } from './configurable.js';

class CustomCSSClass {
    public hasCustomCSS: boolean | null = null;
    private __noCustomCSS: TemplateFnLike = new TemplateFn(
        null,
        CHANGE_TYPE.NEVER,
        null
    );

    constructor(private _self: WebComponentCustomCSSManagerMixinInstance) {}

    public getCustomCSS() {
        if (!this._self.__hasCustomCSS()) {
            return this.__noCustomCSS;
        }

        return this._self.getParentRef(
            this._self.getAttribute(CUSTOM_CSS_PROP_NAME)!
        ) as TemplateFnLike | TemplateFnLike[];
    }
}

/**
 * An instance of the custom-css-manager's mixin's resulting class
 */
export type WebComponentCustomCSSManagerMixinInstance = InferInstance<
    WebComponentCustomCSSManagerMixinClass
> & {
    self: WebComponentCustomCSSManagerMixinClass;
};

/**
 * The custom-css-manager's mixin's resulting class
 */
export type WebComponentCustomCSSManagerMixinClass = InferReturn<
    typeof WebComponentCustomCSSManagerMixin
>;

/**
 * The type required as a parent/super by the custom-css-manager mixin
 */
export type WebComponentCustomCSSManagerMixinSuper = Constructor<
    Pick<HTMLElement, 'setAttribute' | 'hasAttribute' | 'getAttribute'> &
        Pick<WebComponentBaseMixinInstance, 'renderToDOM'> &
        Pick<WebComponentTemplateManagerMixinInstance, 'getParentRef'>
>;

/**
 * A standalone instance of the custom css manager class
 */
export declare class WebComponentCustomCSSManagerTypeInstance {
    /**
     * Whether this component has been mounted
     *
     * @readonly
     */
    public isMounted: boolean;

    /**
     * A function signaling whether this component has custom CSS applied to it
     *
     * @returns {boolean} Whether this component uses custom CSS
     */
    public __hasCustomCSS(): boolean;

    /**
     * Gets this component's custom CSS templates
     *
     * @returns {TemplateFnLike|TemplateFnLike[]} The
     * 	custom CSS templates
     */
    public customCSS(): TemplateFnLike | TemplateFnLike[];
}

/**
 * The static values of the custom css manager class
 */
export type WebComponentCustomCSSManagerTypeStatic = ClassToObj<
    typeof WebComponentCustomCSSManagerTypeInstance
>;

/**
 * A mixin that, when applied, allows
 * for custom css to be passed to a component
 * after which it will be rendered
 *
 * @template P
 *
 * @param {P} superFn - The parent/super that this mixin extends
 */
export const WebComponentCustomCSSManagerMixin = <
    P extends WebComponentCustomCSSManagerMixinSuper
>(
    superFn: P
) => {
    const privateMap: WeakMap<
        WebComponentCustomCSSManager,
        CustomCSSClass
    > = new WeakMap();
    function customCSSClass(
        self: WebComponentCustomCSSManager
    ): CustomCSSClass {
        if (privateMap.has(self)) return privateMap.get(self)!;
        return privateMap.set(self, new CustomCSSClass(self as any)).get(self)!;
    }

    /**
     * The class that manages custom CSS
     */
    class WebComponentCustomCSSManager extends superFn
        implements WebComponentCustomCSSManagerTypeInstance {
        public isMounted: boolean = false;

        constructor(...args: any[]) {
            super(...args);

            const originalSetAttr = this.setAttribute;
            this.setAttribute = (key: string, val: string) => {
                originalSetAttr.bind(this)(key, val);
                if (key === CUSTOM_CSS_PROP_NAME && this.isMounted) {
                    this.renderToDOM(CHANGE_TYPE.ALWAYS);
                }
            };
        }

        public __hasCustomCSS(): boolean {
            const priv = customCSSClass(this);
            if (priv.hasCustomCSS !== null) {
                return priv.hasCustomCSS!;
            }
            if (
                !this.hasAttribute(CUSTOM_CSS_PROP_NAME) ||
                !this.getParentRef(this.getAttribute(CUSTOM_CSS_PROP_NAME)!)
            ) {
                //No custom CSS applies
                if (this.isMounted) {
                    priv.hasCustomCSS = false;
                }
                return false;
            }

            return (priv.hasCustomCSS = true);
        }

        public customCSS(): TemplateFnLike | TemplateFnLike[] {
            return customCSSClass(this).getCustomCSS();
        }
    }

    const __typecheck__: WebComponentCustomCSSManagerTypeStatic = WebComponentCustomCSSManager;
    __typecheck__;

    return WebComponentCustomCSSManager;
};
