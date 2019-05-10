import { TemplateFn, CHANGE_TYPE, Renderer } from '../base.js';
import { WebComponent } from '../component.js';

export namespace Templates {
	/**
	 * Returns fallback value if given array has 0 members. This
	 * can be useful if you are mapping an array to a template
	 * array. If it has length 0, this returns a promise, which
	 * will be recognized as a complex type array instead of nothing
	 * 
	 * @template T - The fallback type
	 * @param {any[]} result - The array
	 * @param {string|T} [fallback] - The fallback value (empty string
	 * 	by default)
	 * 
	 * @returns {any[]|string|T} The array if its length is greater
	 * 	than zero and the fallback value otherwise
	 */
	function createArrayFallback<T>(result: any[], fallback: string|T = ''): any[] | string | T {
		if (result.length === 0) {
			return fallback;
		}
		return result;
	}

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
				if (template.changeOn & CHANGE_TYPE.ALWAYS ||
					prev & CHANGE_TYPE.ALWAYS) {
						return CHANGE_TYPE.ALWAYS
					}
				if (template.changeOn & CHANGE_TYPE.PROP || 
					template.changeOn & CHANGE_TYPE.THEME) {
						if (prev & CHANGE_TYPE.NEVER) {
							return template.changeOn;
						}
						if (!(template.changeOn & prev)) {
							return CHANGE_TYPE.ALWAYS;
						}
						return prev;
					}
				if (prev & CHANGE_TYPE.PROP ||
					prev & CHANGE_TYPE.THEME) {
						return prev;
					}
				return CHANGE_TYPE.NEVER;
			}, CHANGE_TYPE.NEVER);
			return new TemplateFn<T, any, any>(function (html) {
				return html`
					${createArrayFallback(templates.map((template) => {
						return template.renderTemplate(changeType, this);
					}))}
				`;
			}, changeType as any, renderer);
		}
}