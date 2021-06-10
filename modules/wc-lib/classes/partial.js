import { elementBase, WebComponentTemplateManagerMixin, WebComponentI18NManagerMixin, } from './parts.js';
import { WebComponentListenableMixin, } from '../lib/listener.js';
import { WebComponentHierarchyManagerMixin } from '../lib/hierarchy-manager.js';
import { WebComponentMixin } from '../lib/component.js';
import { WebComponentThemeManagerMixin } from '../lib/theme-manager.js';
import { WebComponentDefinerMixin } from '../lib/definer.js';
import { WebComponentBaseMixin } from '../lib/base.js';
const basicWebComponent = WebComponentMixin(WebComponentListenableMixin(WebComponentBaseMixin(WebComponentDefinerMixin(elementBase))));
/**
 * A component that only uses the most basic parts
 * Uses the `definer`, `renderer` and `listeners`
 */
export class BasicWebComponent extends basicWebComponent {
    getRenderArgs(changeType) {
        return super.getRenderArgs(changeType);
    }
}
const themingWebComponent = WebComponentMixin(WebComponentThemeManagerMixin(WebComponentListenableMixin(WebComponentBaseMixin(WebComponentDefinerMixin(elementBase)))));
/**
 * A component that uses the basic parts combined
 * with the theming part.
 * Uses the `theming`,
 * `definer`, `renderer` and `listeners`
 */
export class ThemingWebComponent extends themingWebComponent {
    getRenderArgs(changeType) {
        return super.getRenderArgs(changeType);
    }
}
const i18NWebComponent = WebComponentMixin(WebComponentI18NManagerMixin(WebComponentListenableMixin(WebComponentBaseMixin(WebComponentDefinerMixin(elementBase)))));
/**
 * A component that uses the basic parts combined
 * with the I18N part.
 * Uses the `i18n`,
 * `definer`, `renderer` and `listeners`
 */
export class I18NWebComponent extends i18NWebComponent {
    getRenderArgs(changeType) {
        return super.getRenderArgs(changeType);
    }
}
const complexTemplatingWebComponent = WebComponentMixin(WebComponentTemplateManagerMixin(WebComponentHierarchyManagerMixin(WebComponentListenableMixin(WebComponentBaseMixin(WebComponentDefinerMixin(elementBase))))));
/**
 * A component that uses the basic parts combined
 * with the hierarchy manager.
 * Uses the `hierarchy`,
 * `definer`, `renderer` and `listeners`
 */
export class ComplexTemplatingWebComponent extends complexTemplatingWebComponent {
    getRenderArgs(changeType) {
        return super.getRenderArgs(changeType);
    }
}
//# sourceMappingURL=partial.js.map