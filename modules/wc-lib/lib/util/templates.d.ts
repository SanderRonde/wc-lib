import { TemplateFn, Renderer, CHANGE_TYPE } from '../template-fn.js';
/**
 * Functions related to templates and manipulation of them
 */
export declare namespace Templates {
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
    function joinTemplates<T extends {
        getRenderArgs<CT extends CHANGE_TYPE | number>(changeType: CT): any;
    }>(renderer: Renderer<T>, ...templates: TemplateFn<T, any>[]): TemplateFn<T, any>;
}
//# sourceMappingURL=templates.d.ts.map