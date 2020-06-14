import {
    Props,
    PropConfigObject,
    DefinePropTypes,
    DefinePropTypeConfig,
    GetTSType,
} from '../lib/props.js';
import { ListenerSet, EventListenerObj } from '../lib/listener.js';
import { TemplateFnLike } from '../lib/template-fn.js';
import { ClassNamesArg } from '../lib/shared.js';

/**
 * A constructable function that returns the passed type
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Gets the return type of the passed function
 */
export type InferReturn<F> = F extends (...args: any[]) => infer R ? R : void;

/**
 * Gets an instance of the passed class
 */
export type InferInstance<F> = F extends new (...args: any[]) => infer R
    ? R
    : void;

/**
 * Returns a different type if type is undefined
 */
export type DefaultVal<V, D = {}> = V extends undefined ? D : V;

/**
 * Returns a different type if type is undefined or unknown
 */
export type DefaultValUnknown<V, D = {}> = V extends undefined
    ? D
    : V extends unknown
    ? D
    : V;

/**
 * Returns a different type if type is undefined or unknown
 */
export type FallbackExtends<V, F = {}> = V extends F ? V : F;

/**
 * Infers props of a component from passed component['props']
 */
export type InferProps<
    C extends {
        props: any;
    }
> = {
    [K in keyof C['props']]: C['props'][K];
};

/**
 * Infers the property config of a component from
 * passed component['props']
 */
export type InferPropConfig<
    C extends {
        props: Props<{
            reflect?: PropConfigObject;
            priv?: PropConfigObject;
        }>;
    }
> = C['props'] extends Props<infer P> ? NonNullable<P> : void;

type GetReflectPropConfig<
    C extends {
        reflect?: PropConfigObject;
        priv?: PropConfigObject;
    } | void
> = C extends {
    reflect: any;
}
    ? C['reflect']
    : PropConfigObject;

type GetPrivPropConfig<
    C extends {
        reflect?: PropConfigObject;
        priv?: PropConfigObject;
    } | void
> = C extends {
    priv: any;
}
    ? C['priv']
    : PropConfigObject;

/**
 * Infers the events listener object from the passed component
 */
export type InferEvents<C> = C extends {
    listenerMap: ListenerSet<infer E>;
}
    ? E
    : {};

/**
 * Converts an eventname->event map to an eventname->function map
 */
type EventsToAttr<E> = {
    [EV in keyof E]: (event: E[EV]) => any;
};

/**
 * Converts a customeventname->config map to a customeventname->function map
 */
type CustomEventsToAttr<E extends EventListenerObj> = {
    [EV in keyof E]: (...args: E[EV]['args']) => E[EV]['returnType'];
};

type _Remove<
    A extends {
        [key: string]: any;
    },
    B
> = {
    [K in keyof A]: A[K] extends B ? never : K;
}[keyof A];

type RemoveType<
    A extends {
        [key: string]: any;
    },
    B
> = {
    [K in _Remove<A, B>]: A[K];
};

type IsPropRequired<
    P extends DefinePropTypes | DefinePropTypeConfig
> = P extends DefinePropTypes
    ? false
    : P extends {
          required: true;
      }
    ? true
    : false;

type RequiredProps<R extends PropConfigObject, P extends PropConfigObject> = {
    // Reflective
    [K in keyof RemoveType<
        {
            [K2 in keyof R]: IsPropRequired<R[K2]>;
        },
        false
    >]: GetTSType<R[K]>;
} &
    {
        // Private
        [K in keyof RemoveType<
            {
                [K2 in keyof P]: IsPropRequired<P[K2]>;
            },
            false
        >]: GetTSType<P[K]>;
    };

type OptionalProps<R extends PropConfigObject, P extends PropConfigObject> = {
    // Reflective
    [K in keyof Omit<
        R,
        keyof RemoveType<
            {
                [K2 in keyof R]: IsPropRequired<R[K2]>;
            },
            false
        >
    >]: GetTSType<R[K]>;
} &
    {
        // Private
        [K in keyof Omit<
            P,
            keyof RemoveType<
                {
                    [K2 in keyof P]: IsPropRequired<P[K2]>;
                },
                false
            >
        >]: GetTSType<P[K]>;
    };

/**
 * Generates definitions for passed component. Use this to create a JSX.IntrinsicElements interface.
 * **Example:**
 * ```js
 declare global {
 	namespace JSX {
 		interface IntrinsicElements {
 			"my-element": JSXDefinition<MyElement>;
 		}
 	}
 }
 ```
 */
export type JSXDefinition<
    C extends {
        props: Props<{
            reflect?: PropConfigObject;
            priv?: PropConfigObject;
        }>;
    },
    ATTR = {}
> = ATTR &
    Partial<
        OptionalProps<
            DefaultVal<
                GetReflectPropConfig<InferPropConfig<C>>,
                PropConfigObject
            >,
            DefaultVal<GetPrivPropConfig<InferPropConfig<C>>, PropConfigObject>
        >
    > &
    RequiredProps<
        DefaultVal<GetReflectPropConfig<InferPropConfig<C>>, PropConfigObject>,
        DefaultVal<GetPrivPropConfig<InferPropConfig<C>>, PropConfigObject>
    > & {
        __listeners?: Partial<EventsToAttr<HTMLElementEventMap>>;
        '@'?: Partial<EventsToAttr<HTMLElementEventMap>>;
        __component_listeners?: Partial<CustomEventsToAttr<InferEvents<C>>>;
        '@@'?: Partial<CustomEventsToAttr<InferEvents<C>>>;
        __bools?: Partial<InferProps<C>>;
        '?'?: Partial<InferProps<C>>;
        __refs?: Partial<InferProps<C>>;
        '#'?: Partial<InferProps<C>>;
        id?: string;
        class?: string | ClassNamesArg | ClassNamesArg[];
        'custom-css'?: TemplateFnLike;
    };

/**
 * Intrinsic properties that can be used by the complex
 * templater to turn JSX props into (for example) listeners.
 */
export interface JSXIntrinsicProps {
    __listeners?: Partial<EventsToAttr<HTMLElementEventMap>>;
    '@'?: Partial<EventsToAttr<HTMLElementEventMap>>;
}

export {
    WebComponentBaseMixinInstance,
    WebComponentBaseTypeInstance,
    WebComponentBaseTypeStatic,
    WebComponentBaseMixinClass,
    WebComponentBaseMixinSuper,
} from '../lib/base.js';
export {
    WebComponentMixinInstance,
    WebComponentTypeInstance,
    WebComponentTypeStatic,
    WebComponentMixinClass,
    WebComponentSuper,
} from '../lib/component.js';
export {
    WebComponentCustomCSSManagerMixinInstance,
    WebComponentCustomCSSManagerTypeInstance,
    WebComponentCustomCSSManagerTypeStatic,
    WebComponentCustomCSSManagerMixinClass,
    WebComponentCustomCSSManagerMixinSuper,
} from '../lib/custom-css-manager.js';
export {
    WebComponentDefinerMixinInstance,
    WebComponentDefinerTypeInstance,
    WebComponentDefinerTypeStatic,
    WebComponentDefinerMixinClass,
    WebComponentDefinerMixinSuper,
} from '../lib/definer.js';
export {
    WebComponentHierarchyManagerMixinInstance,
    WebComponentHierarchyManagerTypeInstance,
    WebComponentHierarchyManagerTypeStatic,
    WebComponentHierarchyManagerMixinClass,
    WebComponentHierarchyManagerMixinSuper,
} from '../lib/hierarchy-manager.js';
export {
    WebComponentI18NManagerMixinInstance,
    WebComponentI18NManagerTypeInstance,
    WebComponentI18NManagerTypeStatic,
    WebComponentI18NManagerMixinClass,
    WebComponentI18NManagerMixinSuper,
} from '../lib/i18n-manager.js';
export {
    WebComponentListenableMixinInstance,
    WebComponentListenableTypeInstance,
    WebComponentListenableTypeStatic,
    WebComponentListenableMixinClass,
    WebComponentListenableMixinSuper,
} from '../lib/listener.js';
export {
    WebComponentTemplateManagerMixinInstance,
    WebComponentTemplateManagerTypeInstance,
    WebComponentTemplateManagerTypeStatic,
    WebComponentTemplateManagerMixinClass,
    WebComponentTemplateManagerMixinSuper,
} from '../lib/template-manager.js';
export {
    WebComponentThemeManagerMixinInstance,
    WebComponentThemeManagerTypeInstance,
    WebComponentThemeManagerTypeStatic,
    WebComponentThemeManagerMixinClass,
    WebComponentThemeManagerMixinSuper,
} from '../lib/theme-manager.js';
