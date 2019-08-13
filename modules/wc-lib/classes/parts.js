export { WebComponentCustomCSSManagerMixin } from '../lib/custom-css-manager.js';
export { WebComponentHierarchyManagerMixin } from '../lib/hierarchy-manager.js';
export { WebComponentTemplateManagerMixin } from '../lib/template-manager.js';
export { WebComponentThemeManagerMixin } from '../lib/theme-manager.js';
export { WebComponentI18NManagerMixin } from '../lib/i18n-manager.js';
export { WebComponentListenableMixin } from '../lib/listener.js';
export { WebComponentDefinerMixin } from '../lib/definer.js';
export { WebComponentMixin } from '../lib/component.js';
export { WebComponentBaseMixin } from "../lib/base.js";
/**
 * The base element from which every webcomponent is extended.
 * This will always be HTMLElement regardless of the environment
 */
export const elementBase = (() => {
    /* istanbul ignore else */
    if (typeof HTMLElement !== 'undefined') {
        return HTMLElement;
    }
    else {
        return process.HTMLElement;
    }
})();
//# sourceMappingURL=parts.js.map