import { WebComponentMixin, WebComponentCustomCSSManagerMixin, WebComponentTemplateManagerMixin, WebComponentI18NManagerMixin, WebComponentThemeManagerMixin, WebComponentHierarchyManagerMixin, WebComponentListenableMixin, WebComponentBaseMixin, WebComponentDefinerMixin, elementBase, } from './parts.js';
/**
 * A full webcomponent that uses every layer and provides
 * maximum functionality.
 * Uses the `renderer`, `custom-css`, `complex-template`,
 * `I18N`, `theming`, `hierarchy`, `listeners` and `definer`
 * parts.
 */
export const FullWebComponent = WebComponentMixin(WebComponentCustomCSSManagerMixin(WebComponentTemplateManagerMixin(WebComponentI18NManagerMixin(WebComponentThemeManagerMixin(WebComponentHierarchyManagerMixin(WebComponentListenableMixin(WebComponentBaseMixin(WebComponentDefinerMixin(elementBase)))))))));
/**
 * A class that extends from the full webcomponent and passes
 * the relevant generic types.
 * Uses the `renderer`, `custom-css`, `complex-template`,
 * `I18N`, `theming`, `hierarchy`, `listeners` and `definer`
 * parts.
 */
export class WebComponent extends FullWebComponent {
}
//# sourceMappingURL=full.js.map