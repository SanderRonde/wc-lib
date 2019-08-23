import { WebComponent } from "../../classes/full.js";

/**
 * Waits for the component to have a mounted callback
 * function. It waits for `el.mounted` to be a function
 * instead of undefined.
 * 
 * @param {{ mounted: () => void }} el - The element to watch
 */
export function waitForMountedCallback(el: {
	mounted: () => void;
}): Promise<() => void> {
	return new Promise<() => void>(async (resolve) => {
		/* istanbul ignore next */
		if (el.mounted) {
			resolve(el.mounted);
		} else {
			const interval = window.setInterval(() => {
				if (el.mounted) {
					window.clearInterval(interval);
					resolve(el.mounted);
				}
			}, 50);
		}
	});
}

/**
 * Functions related to listening for mounting of components
 */
export namespace Mounting {
	/**
	 * Waits for given component to be mounted to the DOM.
	 * This can be handy when an element has just been created
	 * (for example through `document.createElement`) but it 
	 * has not yet finished mounting to the dom
	 * 
	 * @param {WebComponent} el - The element to watch
	 * 
	 * @returns {Promise<void>} A promise that resolves when
	 * the component has been mounted
	 */
	export async function awaitMounted(el: WebComponent): Promise<void> {
		const realEl = el as WebComponent;
		if (realEl.isMounted) {
			return;
		}
		await new Promise(async (resolve) => {
			const originalMounted = realEl.mounted ?
				realEl.mounted.bind(realEl) : 
				(await waitForMountedCallback(realEl)).bind(realEl);
			realEl.mounted = () => {
				originalMounted && originalMounted();
				resolve();
			}
		});
	}

	/**
	 * Overrides an element's `.mounted` function and calls
	 * the passed function before calling the original function.
	 * This can be handy if you need to modify an element before
	 * it gets rendered to the DOM but after it has been mounted
	 * 
	 * @param {WebComponentBase} el - The element to watch
	 * @param {() => void)} fn - The function to run instead
	 * 
	 * @returns {Promise<void>} A promise that resolves when
	 * 	the element has been mounted (and as such your function)
	 * 	was ran
	 */
	export async function hookIntoMount(el: WebComponent, fn: () => void): Promise<void> {
		const realEl = el as WebComponent;
		if (realEl.isMounted) {
			fn();
			return;
		}
		await new Promise(async (resolve) => {
			const originalMounted = realEl.mounted ?
				realEl.mounted.bind(realEl) : 
				(await waitForMountedCallback(realEl)).bind(realEl);
			realEl.mounted = () => {
				fn();
				originalMounted && originalMounted();
				resolve();
			}
		});
	}
}