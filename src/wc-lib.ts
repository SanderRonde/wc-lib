/**
 * Essential exports and exports that come in handy
 * when creating webcomponents with this library
 **/

export { bindToClass } from './lib/base.js';
export type {
    Renderer,
    TemplateFnLike,
    TemplateRenderFunction,
    TemplateRenderResult,
    Templater,
} from './lib/template-fn.js';
export { TemplateFn, CHANGE_TYPE, createUniqueChangeType } from './lib/template-fn.js'
export type { SelectorMap, PropChangeEvents } from './lib/component.js';
export type {
    MixinFn,
} from './lib/configurable.js';
export {
    ConfigurableWebComponent,
    ConfigurableMixin,
    ExtendableMixin,
    mixin,
    config,
} from './lib/configurable.js';
export { DefineMetadata } from './lib/definer.js';
export type { EventListenerObj } from './lib/listener.js';
export { Listeners } from './lib/listeners.js';
export type {
    DefinePropTypeConfig,
} from './lib/props.js';
export {
    Props,
    ComplexType,
    PROP_TYPE,
    hookIntoConnect,
} from './lib/props.js';
export * from './lib/shared.js';
export type { LitHTMLConfig, TemplateResultLike } from './lib/template-manager.js';
export * from './lib/util.js';
export { noTheme } from './lib/theme-manager.js';
export { css } from './lib/css.js';
export type { JSXBase } from './lib/jsx-render.js';
export { html, jsxToLiteral, jsx } from './lib/jsx-render.js';

export { WebComponent } from './classes/full.js';
