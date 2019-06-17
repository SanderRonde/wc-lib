import { TemplateFn, CHANGE_TYPE, Renderer } from '../base.js';
import { WebComponent } from '../component.js';

export namespace Templates {
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
	export function joinTemplates<T extends WebComponent<any>>(
		renderer: Renderer<T>, ...templates: TemplateFn<T, any, any>[]): TemplateFn<T, any, any> {
			const changeType = templates.reduce((prev, template) => {
				return prev | template.changeOn;
			}, 0) || CHANGE_TYPE.NEVER;
			return new TemplateFn<T, any, any>(function (html) {
				return html`${templates.map((template) => {
					return template.renderSame(changeType, this, html);
				})}`;
			}, changeType as any, renderer);
		}
}