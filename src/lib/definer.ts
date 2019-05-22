import { WebComponent } from './component.js';
import { WebComponentBase } from './base.js';

interface ExtendedProcess extends NodeJS.Process {
	HTMLElement: typeof HTMLElement;
}

function define(name: string, component: any) {
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

export class DefineMetadata {
	public static defined: number = 0;
	private static _listeners: ((amount: number) => any)[] = [];

	public static increment() {
		this.defined++;
		this._listeners.forEach(l => l(this.defined));
	}

	public static onDefine(listener: (amount: number) => any) {
		this._listeners.push(listener);
	}

	public static onReach(amount: number, listener: (amount: number) => any) {
		this._listeners.push((currentAmount) => {
			if (currentAmount === amount) {
				listener(amount);
			}
		});
	}
}

/**
 * The class that manages defining of this component
 * and its dependencies
 */
export abstract class WebComponentDefiner extends elementBase {
	/**
	 * The class associated with this one that
	 * contains some functions required for 
	 * it to function
	 * 
	 * @private
	 * @readonly
	 */
	public ___definerClass: DefinerClass = new DefinerClass();
	/**
	 * The class associated with this one that
	 * contains some functions required for 
	 * it to function
	 * 
	 * @private
	 * @readonly
	 */
	private static ___definerClass: typeof DefinerClass = DefinerClass;

	/**
	 * Dependencies of this component. If this
	 * component uses other components in its
	 * template, adding them to this array will
	 * make sure they are defined before this
	 * component is
	 * 
	 * @readonly
	 */
	public static dependencies?: (typeof WebComponentBase|null)[] = [];
	/**
	 * The name of this component
	 * 
	 * @readonly
	 */
	public static is: string;
	

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
	 * so they can be used
	 * 
	 * @param {boolean} [isRoot] - Set to true if this is
	 * 	not a dependency (which most definitions aren't)
	 * 	True by default
	 */
	static define(isRoot: boolean = true) {
		if (isRoot && this.___definerClass.finished) {
			//Another root is being defined, clear last one
			this.___definerClass.finished = false;
			this.___definerClass.listeners = [];
		}

		for (const dependency of this.dependencies || []) {
			dependency && dependency.define(false);
		}
		if (!this.is) {
			throw new Error('No component definition given (name and class)')
		}
		if (!this.is) {
			throw new Error('No name given for component');
		}
		define(this.is, this);
		this.___definerClass.defined.push(this.is);
		DefineMetadata.increment();

		this.___definerClass.finishLoad();
	}
}