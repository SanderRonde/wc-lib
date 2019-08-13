import { FullWebComponent } from '../classes/full.js';
/**
 * A configurable web component. This is the basic
 * component you should extend to create new
 * components. This can be annotated with an
 * `@config` decorator to define the class
 *
 * @template ELS - The elements found in this component's HTML
 * @template E - An object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
export class ConfigurableWebComponent extends FullWebComponent {
    /**
     * The element's constructor
     *
     * @readonly
     */
    /* istanbul ignore next */
    get self() { return null; }
}
/**
 * A mixin base for use with the `@config` method
 * of configuring the element
 */
export const ConfigurableMixin = (_superFn) => ConfigurableWebComponent;
/**
 * A mixin base for use with the manual adding/extending of
 * the `.css`, `.html`, `.is` and `.self` properties
 */
export const ExtendableMixin = (_superFn) => FullWebComponent;
/**
 * Joins given mixins into a single merged class.
 * Be sure to pass the base class
 * (`Mixin`, `MixinConfigured` or your
 * own class) as the first argument to make sure it
 * inherits from that as well when creating the
 * final component. If you want to merge
 * properties as well, make sure to pass `super.props`
 * as the third argument to `Props.define` when you
 * call it (see examples).
 *
 * **Examples:**
 * ```js
 const A = (superFn) => class A extends superFn {
     a = 0
 }
 const B = (superFn) => class B extends superFn {
     b = 1
 }
 const C = mixin(A, B);
 new C().a; // 0
 new C().b; // 1

 const D = (superFn) => class D extends superFn {
     props = Define.props(this, {
         d: PROP_TYPE.NUMBER
    })}
 }
 const E = (superFn) => class E extends superFn {
     props = Define.props(this, {
         e: PROP_TYPE.NUMBER
    }, super.props)
 }
 const F = mixin(D, E);
 new F().props; // { d: number, e: number }

 const Loggable = (superFn) => class Loggable extends superFn {
    log(...args) {
        console.log(...args);
    }
 }
 @config({
    // ...
 })
 class LoggableElement extends mixin(ConfigurableMixin, Loggable) {
    constructor() {
        this.log('exists!');
    }
 }
 ```
 *
 */
/**
 * Configures a component to make sure it can
 * be defined
 *
 * @param {WebComponentConfiguration} config - The
 * 	configuration for this component
 */
export function config(config) {
    const { is, html, css = [], mixins = [], dependencies = [] } = config;
    return (target) => {
        const targetComponent = target;
        class WebComponentConfig extends targetComponent {
            get self() {
                return WebComponentConfig;
            }
        }
        WebComponentConfig.is = is;
        /* istanbul ignore next */
        WebComponentConfig.dependencies = [...targetComponent.dependencies || [], ...dependencies]
            .filter((dependency, index, arr) => arr.indexOf(dependency) === index);
        WebComponentConfig.mixins = mixins;
        WebComponentConfig.html = html;
        WebComponentConfig.css = css || [];
        target.mixins = mixins;
        target.dependencies = dependencies;
        return WebComponentConfig;
    };
}
export function mixin(mixin1, mixin2, mixin3, mixin4, mixin5, mixin6, mixin7, mixin8, mixin9, mixin10) {
    let current = class {
    };
    const mixins = [
        mixin1, mixin2, mixin3, mixin4, mixin5,
        mixin6, mixin7, mixin8, mixin9, mixin10
    ];
    for (const mixin of mixins) {
        if (!mixin)
            break;
        current = mixin(current);
    }
    return current;
}
//# sourceMappingURL=configurable.js.map