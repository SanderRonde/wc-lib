import { TemplateFn, CHANGE_TYPE, Renderer } from '../base.js';
import { WebComponent } from '../component.js';

/**
 * Map an array but return an empty string if its length is 0
 * this avoids the inlining of a complex value 0-length array
 */
export function mapArr<T>(result: any[], fallback: string|T = '') {
	if (result.length === 0) {
		return fallback;
	}
	return result;
}


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
				${mapArr(templates.map((template) => {
					return template.renderTemplate(changeType, this);
				}))}
			`;
		}, changeType as any, renderer);
	}