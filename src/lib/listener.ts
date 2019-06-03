import { WebComponentBase } from './base.js';

/**
 * An object that maps an event name
 * to the event listener's arguments
 * and return type
 */
export interface EventListenerObj {
	/**
	 * The event name
	 */
	[key: string]: {
		/**
		 * Arguments passed to the listener
		 */
		args: any[];
		/***
		 * The return type of the listener
		 */
		returnType?: any;
	};
}

/**
 * The class responsible for handling the
 * listening and firing of events on this
 * component
 * 
 * @template E - An object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
class ListenableClass<E extends EventListenerObj> {
	/**
	 * A map that maps every event name to
	 * a set containing all of its listeners
	 * 
	 * @readonly
	 */
	public listenerMap: {
		[P in keyof E]: Set<(...params: E[P]['args']) => E[P]['returnType']>;
	} = {} as any;

	/**
	 * Inserts a listener to only be called
	 * once
	 * 
	 * @private
	 * @template T - The event's data
	 * @template L - The listener
	 * 
	 * @param {Set<L>} fns - The functions that
	 * 	are listening to this event
	 * @param {L} The new listener
	 */
	private __insertOnce<T extends E[keyof E], L extends (...args: T['args']) => T['returnType']>(fns: Set<L>, listener: L) {
		const self = ((...args: T['args']) => {
			fns.delete(self);
			listener(...args);
		}) as L;
		fns.add(self);
	}

	/**
	 * Asserts that a set for given
	 * event exists
	 * 
	 * @template EV - The event's name
	 * @template T - The event map
	 * 
	 * @param {EV} key - The name of the
	 * 	event
	 * @param {T} value - The event map
	 */
	private __assertKeyExists<EV extends keyof T, T extends {
		[P in keyof E]: Set<(...params: E[P]['args']) => E[P]['returnType']>;
	}>(key: EV, value: T) {
		if (!(key in value)) {
			value[key] = new Set() as any;
		}
	}

	/**
	 * Listens for given event and fires
	 * the listener when it's triggered
	 * 
	 * @template EV - The event's name
	 * 
	 * @param {EV} event - The event's name
	 * @param {(...args: E[EV]['args']) => E[EV]['returnType']} listener - The
	 * 	listener called when the event is fired
	 * @param {boolean} [once] - Whether to only
	 * 	call this listener once (false by default)
	 */
	public listen<EV extends keyof E>(event: EV, listener: (...args: E[EV]['args']) => E[EV]['returnType'], once: boolean = false) {
		this.__assertKeyExists(event, this.listenerMap);
		if (once) {
			this.__insertOnce(this.listenerMap[event], listener);
		} else {
			this.listenerMap[event].add(listener);
		}
	}
}

/**
 * The class responsible for handling listening
 * and firing of events
 * 
 * @template E - An object map of events to its args and return value.
 */
export abstract class WebComponentListenable<E extends EventListenerObj> extends WebComponentBase {
	/**
	 * The class associated with this one that
	 * contains some functions required for 
	 * it to function
	 * 
	 * @private
	 * @readonly
	 */
	protected ___listenableClass: ListenableClass<E> = new ListenableClass<E>();

	/**
	 * Listens for given event and fires
	 * the listener when it's triggered
	 * 
	 * @template EV - The event's name
	 * 
	 * @param {EV} event - The event's name
	 * @param {(...args: E[EV]['args']) => E[EV]['returnType']} listener - The
	 * 	listener called when the event is fired
	 * @param {boolean} [once] - Whether to only
	 * 	call this listener once (false by default)
	 */
	public listen<EV extends keyof E>(event: EV, listener: (...args: E[EV]['args']) => E[EV]['returnType'], once: boolean = false) {
		this.___listenableClass.listen(event, listener, once);
	}

	/**
	 * Clears all listeners on this component for
	 * given event
	 * 
	 * @template EV - The name of the event
	 * 
	 * @param {EV} event - The name of the event to clear
	 * @param {(...args: E[EV]['args']) => E[EV]['returnType']} [listener] - A
	 * 	specific listener to clear. If not passed, clears all
	 * 	listeners for the event
	 */
	public clearListener<EV extends keyof E>(event: EV, listener?: (...args: E[EV]['args']) => E[EV]['returnType']) {
		if (event in this.___listenableClass.listenerMap) {
			const eventListeners = this.___listenableClass.listenerMap[event];
			if (!listener) {
				eventListeners.clear();
				return;
			}
			eventListeners.delete(listener);
		}
	}

	/**
	 * Fires given event on this component
	 * with given params, returning an array
	 * containing the return values of all
	 * triggered listeners
	 * 
	 * @template EV - The event's name
	 * @template R - The return type of the
	 * 	event's listeners
	 * 
	 * @param {EV} event - The event's anme
	 * @param {E[EV]['args']} params - The parameters
	 * 	passed to the listeners when they are
	 * 	called
	 * 
	 * @returns {R[]} An array containing the
	 * 	return values of all triggered
	 * 	listeners
	 */
	public fire<EV extends keyof E, R extends E[EV]['returnType']>(event: EV, ...params: E[EV]['args']): R[] {
		if (!(event in this.___listenableClass.listenerMap)) {
			return [];
		}

		const set = this.___listenableClass.listenerMap[event];
		const returnValues: R[] = [];
		for (const listener of set.values()) {
			returnValues.push(listener(...params));
		}
		return returnValues;
	}
}