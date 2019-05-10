import { supportsPassive } from '../shared.js';

/**
 * Creates a listener on `target` that can be disposed of by calling the 
 * returned function
 * 
 * @template T - The target on which to create the listener
 * @template E - The event to listen for
 * @param {T} target - The target on which to create the listener
 * @param {E} event - The event to listen for
 * @param {(event: HTMLElementEventMap[E]) => any} listener - The 
 * 	listener that gets called when the event is fired
 * @param {boolean|AddEventListenerOptions} [options] Optional
 * 	options for the addEventListener function
 * 
 * @returns {() => void} A function that, when called,
 * 	removes the listener
 */
export function createDisposableListener<T extends HTMLElement, E extends keyof HTMLElementEventMap>(
	target: T, event: E, listener: (event: HTMLElementEventMap[E]) => any, 
	options?: boolean|AddEventListenerOptions): () => void {
		if (options || typeof options === 'boolean' && supportsPassive()) {
			target.addEventListener(event, listener, options);
		} else {
			target.addEventListener(event, listener);
		}
		return () => {
			target.removeEventListener(event, listener);
		}
	}

/**
 * Creates a listener on `windwo` that can be disposed of by calling the 
 * returned function
 * 
 * @template E - The event to listen for
 * @param {E} event - The event to listen for
 * @param {(event: HTMLElementEventMap[E]) => any} listener - The 
 * 	listener that gets called when the event is fired
 * @param {boolean|AddEventListenerOptions} [options] Optional
 * 	options for the addEventListener function
 * 
 * @returns {() => void} A function that, when called,
 * 	removes the listener
 */
export function createDisposableWindowListener<E extends keyof WindowEventMap>(
	event: E, listener: (this: Window, ev: WindowEventMap[E]) => any,
	options?: boolean|AddEventListenerOptions): () => void {
		if (options || typeof options === 'boolean' && supportsPassive()) {
			window.addEventListener(event, listener, options);
		} else {
			window.addEventListener(event, listener);
		}
		return () => {
			window.removeEventListener(event, listener);
		}
	}