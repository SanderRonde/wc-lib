import { WebComponentTemplateManager, CUSTOM_CSS_PROP_NAME } from './template-manager';
import { CHANGE_TYPE, TemplateFn } from './base';
import { EventListenerObj } from './listener';

class CustomCSSClass {
	public hasCustomCSS: boolean|null = null;
	private __noCustomCSS: TemplateFn = new TemplateFn(null, CHANGE_TYPE.NEVER);

	constructor(private _self: WebComponentCustomCSSManager<any>) { }

	public getCustomCSS() {
		if (!this._self.__hasCustomCSS()) {
			return this.__noCustomCSS;
		}

		return this._self.getParentRef(
			this._self.getAttribute(CUSTOM_CSS_PROP_NAME)!) as TemplateFn<any>|TemplateFn<any>[]
	}
}

export abstract class WebComponentCustomCSSManager<E extends EventListenerObj> extends WebComponentTemplateManager<E> {
	private ___customCSSClass: CustomCSSClass = new CustomCSSClass(this);

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

	public __hasCustomCSS() {
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

	public customCSS() {
		return this.___customCSSClass.getCustomCSS();
	}
}