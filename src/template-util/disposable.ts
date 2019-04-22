import { supportsPassive } from '../shared';

export function createDisposableListener<T extends HTMLElement, E extends keyof HTMLElementEventMap>(
	target: T, event: E, listener: (ev: HTMLElementEventMap[E]) => any, 
	options?: boolean|AddEventListenerOptions) {
		if (options || typeof options === 'boolean' && supportsPassive()) {
			target.addEventListener(event, listener, options);
		} else {
			target.addEventListener(event, listener);
		}
		return () => {
			target.removeEventListener(event, listener);
		}
	}

export function createDisposableWindowListener<E extends keyof WindowEventMap>(
	event: E, listener: (this: Window, ev: WindowEventMap[E]) => any,
	options?: boolean|AddEventListenerOptions) {
		if (options || typeof options === 'boolean' && supportsPassive()) {
			window.addEventListener(event, listener, options);
		} else {
			window.addEventListener(event, listener);
		}
		return () => {
			window.removeEventListener(event, listener);
		}
	}