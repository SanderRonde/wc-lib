import { wait } from '../shared';

const timeouts: WeakMap<any, Map<string, NodeJS.Timer>> = new WeakMap();
/**
 * Register a callback and, when this is called again with the same params, cancels
 * the previously registered timeout
 */
export function createCancellableTimeout(el: any, name: string, callback: () => void, waitTime: number) {
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
 */
export function cancelTimeout(el: any, name: string) {
	if (!timeouts.has(el)) return;

	const elMap = timeouts.get(el)!;
	if (!elMap.has(name)) return;

	clearTimeout(elMap.get(name)!);
	elMap.delete(name);
}