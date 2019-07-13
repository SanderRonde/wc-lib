/// <reference path="../node_modules/@types/react/index.d.ts" />

import { ListenerSet, EventListenerObj } from '../src/lib/listener';
import { WebComponent } from '../src/classes/full';
import { Props } from '../src/lib/props';

type InferProps<C> = C extends Props & infer P ? P : void;

type InferEvents<C> = C extends {
	listenerMap: ListenerSet<infer E>;
} ? E : void;

type EventsToAttr<E, EL> = {
	[EV in keyof E]: (this: EL, event: E[EV]) => any;
}

type CustomEventsToAttr<E extends EventListenerObj> = {
	[EV in keyof E]: (...args: E[EV]["args"]) => E[EV]["returnType"];
}

declare global {
	type JSXDefinition<C extends WebComponent<any, any>> = 
		React.HTMLAttributes<C> & 
		Partial<InferProps<C['props']>> & {
			__listeners?: Partial<EventsToAttr<HTMLElementEventMap, C>>;
			___listeners?: Partial<CustomEventsToAttr<InferEvents<C>>>;
		};
}