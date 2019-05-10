import { wait } from '../shared.js';

export namespace Timeout {
	const timeouts: WeakMap<any, Map<string, NodeJS.Timer>> = new WeakMap();
	/**
	 * Creates a timer that, when called again, refreshes the
	 * timer instead of registering a second one and calling
	 * the callback function twice
	 * 
	 * @param {any} el - The function on which to register this
	 * 	timer. Serves as a way to remember this registration
	 * @param {string} name - The name of this timeout
	 * @param {() => void} callback - The function to call
	 * 	when the time expires
	 * @param {number} waitTime - How long to wait
	 * 
	 * @returns {Promise<void>} A promise that resolves
	 * 	when the time expires (this is not cancelled)
	 * 	when the timer is refreshed
	 */
	export function createCancellableTimeout(el: any, name: string, callback: () => void, waitTime: number): Promise<void> {
		if (!timeouts.has(el)) {
			timeouts.set(el, new Map());
		}
		const elMap = timeouts.get(el)!;
		if (elMap.has(name)) {
			cancelTimeout(el, name);
		}
		elMap.set(name, setTimeout(callback, waitTime));
		return wait(waitTime);
	}

	/**
	 * Cancels the timeout registered to given element with given name
	 * 
	 * @param {any} el - The function on which to register this
	 * 	timer. Serves as a way to remember this registration
	 * @param {string} name - The name of this timeout
	 */
	export function cancelTimeout(el: any, name: string): void {
		if (!timeouts.has(el)) return;

		const elMap = timeouts.get(el)!;
		if (!elMap.has(name)) return;

		clearTimeout(elMap.get(name)!);
		elMap.delete(name);
	}
}