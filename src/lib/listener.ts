import { WebComponentBase } from './base';

export interface EventListenerObj {
	[key: string]: {
		args: any[];
		returnType?: any;
	};
}

class ListenableClass<E extends EventListenerObj> {
	public listenerMap: {
		[P in keyof E]: Set<(...params: E[P]['args']) => E[P]['returnType']>;
	} = {} as any;

	private __insertOnce<T extends E[keyof E], L extends (...args: T['args']) => T['returnType']>(fns: Set<L>, listener: L) {
		const self = ((...args: T['args']) => {
			fns.delete(self);
			listener(...args);
		}) as L;
		fns.add(self);
	}

	private __assertKeyExists<EV extends keyof T, T extends {
		[P in keyof E]: Set<(...params: E[P]['args']) => E[P]['returnType']>;
	}>(key: EV, value: T) {
		if (!(key in value)) {
			value[key] = new Set() as any;
		}
	}

	public listen<EV extends keyof E>(event: EV, listener: (...args: E[EV]['args']) => E[EV]['returnType'], once: boolean = false) {
		this.__assertKeyExists(event, this.listenerMap);
		if (once) {
			this.__insertOnce(this.listenerMap[event], listener);
		} else {
			this.listenerMap[event].add(listener);
		}
	}

	public __clearListeners<EV extends keyof E>(event: EV) {
		if (event in this.listenerMap) {
			this.listenerMap[event].clear();
		}
	}
}

export abstract class WebComponentListenable<E extends EventListenerObj> extends WebComponentBase {
	protected ___listenableClass: ListenableClass<E> = new ListenableClass<E>();

	public listen<EV extends keyof E>(event: EV, listener: (...args: E[EV]['args']) => E[EV]['returnType'], once: boolean = false) {
		this.___listenableClass.listen(event, listener, once);
	}

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