import { TemplateFn } from '../template-fn.js';
/**
 * Functions related to templates and manipulation of them
 */
export var Templates;
(function (Templates) {
    /**
     * Joins two templates' contents, running them all when the
     * new template is called. This also merges their CHANGE_TYPEs,
     * making sure they are all executed when one of the change
     * types is true
     *
     * @template T - The webcomponent that serves as the base
     * 	for these templates
     * @param {Renderer<T>} renderer - The renderer function
     * 	for these templates
     * @param {TemplateFn<T, any, any>[]} templates - The
     * 	templates to merge
     *
     * @returns {TemplateFn<T, any, any>} The merged template
     */
    function joinTemplates(renderer, ...templates) {
        const changeType = templates.reduce((prev, template) => {
            return prev | template.changeOn;
        }, 0);
        return new TemplateFn(function (html) {
            return html `
                    ${templates.map((template) => {
                return template.renderSame(changeType, this, html);
            })}
                `;
        }, changeType, renderer);
    }
    Templates.joinTemplates = joinTemplates;
})(Templates || (Templates = {}));
//# sourceMappingURL=templates.js.map