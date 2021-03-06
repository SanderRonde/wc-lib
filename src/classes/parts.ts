export { WebComponentCustomCSSManagerMixin } from '../lib/custom-css-manager.js';
export { WebComponentHierarchyManagerMixin } from '../lib/hierarchy-manager.js';
export { WebComponentTemplateManagerMixin } from '../lib/template-manager.js';
export { WebComponentThemeManagerMixin } from '../lib/theme-manager.js';
export { WebComponentI18NManagerMixin } from '../lib/i18n-manager.js';
export { WebComponentListenableMixin } from '../lib/listener.js';
export { WebComponentDefinerMixin } from '../lib/definer.js';
export { WebComponentMixin } from '../lib/component.js';
export { WebComponentBaseMixin } from '../lib/base.js';

interface ExtendedProcess extends NodeJS.Process {
    HTMLElement: typeof HTMLElement;
}

export class FallbackHTMLElement {
    attachShadow(_init: any): any {
        return {};
    }
    /* istanbul ignore next */
    get tagName() {
        return '';
    }
    /* istanbul ignore next */
    setAttribute() {}
    /* istanbul ignore next */
    removeAttribute() {}
    /* istanbul ignore next */
    hasAttribute() {
        return false;
    }
}

/**
 * The base element from which every webcomponent is extended.
 * This will always be HTMLElement regardless of the environment
 */
export const elementBase: typeof HTMLElement = (() => {
    if (typeof HTMLElement !== 'undefined') {
        return HTMLElement;
    } else {
        return (<ExtendedProcess>process).HTMLElement || FallbackHTMLElement;
    }
})();
