import { WebComponentTemplateManagerMixinInstance } from './template-manager.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { Constructor, InferInstance, InferReturn } from '../classes/types.js';
import { TemplateFnLike } from './template-fn.js';
import { ClassToObj } from './configurable.js';
/**
 * An instance of the custom-css-manager's mixin's resulting class
 */
export declare type WebComponentCustomCSSManagerMixinInstance = InferInstance<WebComponentCustomCSSManagerMixinClass> & {
    self: WebComponentCustomCSSManagerMixinClass;
};
/**
 * The custom-css-manager's mixin's resulting class
 */
export declare type WebComponentCustomCSSManagerMixinClass = InferReturn<typeof WebComponentCustomCSSManagerMixin>;
/**
 * The type required as a parent/super by the custom-css-manager mixin
 */
export declare type WebComponentCustomCSSManagerMixinSuper = Constructor<Pick<HTMLElement, 'setAttribute' | 'hasAttribute' | 'getAttribute'> & Pick<WebComponentBaseMixinInstance, 'renderToDOM'> & Pick<WebComponentTemplateManagerMixinInstance, 'getParentRef'>>;
/**
 * A standalone instance of the custom css manager class
 */
export declare class WebComponentCustomCSSManagerTypeInstance {
    /**
     * Whether this component has been mounted
     *
     * @readonly
     */
    isMounted: boolean;
    /**
     * A function signaling whether this component has custom CSS applied to it
     *
     * @returns {boolean} Whether this component uses custom CSS
     */
    __hasCustomCSS(): boolean;
    /**
     * Gets this component's custom CSS templates
     *
     * @returns {TemplateFnLike|TemplateFnLike[]} The
     * 	custom CSS templates
     */
    customCSS(): TemplateFnLike | TemplateFnLike[];
}
/**
 * The static values of the custom css manager class
 */
export declare type WebComponentCustomCSSManagerTypeStatic = ClassToObj<typeof WebComponentCustomCSSManagerTypeInstance>;
/**
 * A mixin that, when applied, allows
 * for custom css to be passed to a component
 * after which it will be rendered
 *
 * @template P
 *
 * @param {P} superFn - The parent/super that this mixin extends
 */
export declare const WebComponentCustomCSSManagerMixin: <P extends Constructor<Pick<HTMLElement, "getAttribute" | "hasAttribute" | "setAttribute"> & Pick<WebComponentBaseMixinInstance, "renderToDOM"> & Pick<WebComponentTemplateManagerMixinInstance, "getParentRef">>>(superFn: P) => {
    new (...args: any[]): {
        isMounted: boolean;
        __hasCustomCSS(): boolean;
        customCSS(): TemplateFnLike | TemplateFnLike[];
        getAttribute: (qualifiedName: string) => string | null;
        hasAttribute: (qualifiedName: string) => boolean;
        setAttribute: (qualifiedName: string, value: string) => void;
        renderToDOM: (change?: number) => void;
        getParentRef: (ref: string) => import("./template-manager.js").ComplexValue;
    };
} & P;
//# sourceMappingURL=custom-css-manager.d.ts.map