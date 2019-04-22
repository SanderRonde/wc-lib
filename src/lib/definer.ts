import { ComponentIs } from './configurable';
import { WebComponent } from './component';
import { WebComponentBase } from './base';

interface ExtendedProcess extends NodeJS.Process {
	HTMLElement: typeof HTMLElement;
}

export function define(name: string, component: any) {
	if (window.customElements.get(name)) {
		return;
	}
	window.customElements.define(name, component);
}

const elementBase: typeof HTMLElement = typeof HTMLElement !== 'undefined' ? 
	HTMLElement : (<ExtendedProcess>process).HTMLElement;

class DefinerClass {
	/**
	 * Any internal properties that are only used by the framework
	 */
	public internals: {
		/**
		 * Any hooks that should be called after the constructor
		 */
		connectedHooks: (() => void)[];
		/**
		 * Any hooks that should be called after rendering
		 */
		postRenderHooks: (() => void)[];
		/**
		 * Global properties
		 */
		globalProperties: any;
	} = {
		connectedHooks: [],
		postRenderHooks: [],
		globalProperties: undefined as any
	};
	/**
	 * All defined webcomponents
	 */
	public static defined: string[] = [];

	constructor() { }

	public static finished: boolean = false;
	public static listeners: {
		component: WebComponent<any, any>;
		constructed: Promise<void>;
	}[] = [];
	public static async listenForFinished(component: WebComponent<any, any>, isConstructed: Promise<void>) {
		if (this.finished) {
			await isConstructed;
			component.isMounted = true;
			component.mounted();
		} else {
			this.listeners.push({
				component,
				constructed: isConstructed
			});
		}
	}

	private static __doSingleMount(component: WebComponent<any, any>) {
		return new Promise((resolve) => {
			(window.requestAnimationFrame || window.webkitRequestAnimationFrame)(() => {
				if (component.isMounted) {
					resolve();
					return;
				}
				component.isMounted = true;
				component.mounted();
				resolve();
			});
		});
	}

	public static async finishLoad() {
		this.finished = true;
		if (window.requestAnimationFrame || window.webkitRequestAnimationFrame) {
			for (const { component, constructed } of [...this.listeners]) {
				await constructed;
				await this.__doSingleMount(component);
			}
		} else {
			this.listeners.forEach(async ({ constructed, component }) => {
				await constructed;
				if (component.isMounted) {
					return;
				}
				component.isMounted = true;
				component.mounted();
			});
		}
	}
}

export abstract class WebComponentDefiner extends elementBase {
	public ___definerClass: DefinerClass = new DefinerClass();
	private static ___definerClass: typeof DefinerClass = DefinerClass;

	/**
	 * Any dependencies this component depends on
	 */
	public static dependencies: (typeof WebComponentBase|null)[] = [];
	/**
	 * A tuple consisting of the name of the component and its class
	 */
	public static is: ComponentIs;
	

	constructor() {
		super();

		const isConnected = new Promise<void>((resolve) => {
			this.___definerClass.internals.connectedHooks.push(() => {
				resolve();
			});
		});
		const definer = customElements.get(this.tagName.toLowerCase()) as typeof WebComponentDefiner;
		definer.___definerClass.listenForFinished(this as any, isConnected);
	}

	/**
	 * Define this component and its dependencies as a webcomponent
	 */
	static define(isRoot: boolean = true) {
		if (isRoot && this.___definerClass.finished) {
			//Another root is being defined, clear last one
			this.___definerClass.finished = false;
			this.___definerClass.listeners = [];
		}

		for (const dependency of this.dependencies) {
			dependency && dependency.define(false);
		}
		if (!this.is) {
			throw new Error('No component definition given (name and class)')
		}
		if (!this.is.name) {
			throw new Error('No name given for component');
		}
		if (!this.is.component) {
			throw new Error('No class given for component');
		}
		define(this.is.name, this.is.component);
		this.___definerClass.defined.push(this.is.name);

		this.___definerClass.finishLoad();
	}
}