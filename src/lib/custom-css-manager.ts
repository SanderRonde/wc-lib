import { WebComponentTemplateManager, CUSTOM_CSS_PROP_NAME } from './template-manager.js';
import { CHANGE_TYPE, TemplateFn } from './base.js';
import { EventListenerObj } from './listener.js';

class CustomCSSClass {
	public hasCustomCSS: boolean|null = null;
	private __noCustomCSS: TemplateFn<any, any, any> = 
		new TemplateFn(null, CHANGE_TYPE.NEVER, () => {});

	constructor(private _self: WebComponentCustomCSSManager<any>) { }

	public getCustomCSS() {
		if (!this._self.__hasCustomCSS()) {
			return this.__noCustomCSS;
		}

		return this._self.getParentRef(
			this._self.getAttribute(CUSTOM_CSS_PROP_NAME)!) as TemplateFn<any, any, any>|TemplateFn<any, any, any>[]
	}
}

/**
 * The class that manages custom CSS
 * 
 * @template E - An object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
export abstract class WebComponentCustomCSSManager<E extends EventListenerObj> extends WebComponentTemplateManager<E> {
	/**
	 * The class associated with this one that
	 * contains some functions required for 
	 * it to function
	 * 
	 * @private
	 * @readonly
	 */
	private ___customCSSClass: CustomCSSClass = new CustomCSSClass(this);

	/**
	 * Whether this component has been mounted
	 * 
	 * @readonly
	 */
	public abstract isMounted: boolean;

	constructor() {
		super();

		const originalSetAttr = this.setAttribute;
		this.setAttribute = (key: string, val: string) => {
			originalSetAttr.bind(this)(key, val);
			if (key === CUSTOM_CSS_PROP_NAME && this.isMounted) {
				this.renderToDOM(CHANGE_TYPE.ALWAYS);
			}
		}
	}

	/**
	 * A function signaling whether this component has custom CSS applied to it
	 * 
	 * @returns {boolean} Whether this component uses custom CSS
	 */
	public __hasCustomCSS(): boolean {
		if (this.___customCSSClass.hasCustomCSS !== null) {
			return this.___customCSSClass.hasCustomCSS;
		}
		if (!this.hasAttribute(CUSTOM_CSS_PROP_NAME) ||
			!this.getParentRef(this.getAttribute(CUSTOM_CSS_PROP_NAME)!)) {
				//No custom CSS applies
				if (this.isMounted) {
					this.___customCSSClass.hasCustomCSS = false;
				}
				return false;
			}

		return (this.___customCSSClass.hasCustomCSS = true);
	}

	/**
	 * Gets this component's custom CSS templates
	 * 
	 * @returns {TemplateFn<any, any, any>|TemplateFn<any, any, any>[]} The
	 * 	custom CSS templates
	 */
	public customCSS(): TemplateFn<any, any, any>|TemplateFn<any, any, any>[] {
		return this.___customCSSClass.getCustomCSS();
	}
}