import { DirectiveFn, Part, directive as litHTMLDirective } from 'lit-html';
import { TemplateClass } from '../template-manager.js';
import { assignAsGetter } from '../base.js';

export type Watchable<T extends Object> = T & {
    __watch<K extends keyof T>(key: K, onChange: (value: T[K]) => void): void;
};

export type Watched<V> = {
    [K in keyof V]: DirectiveFn;
};

export type WatchedFn<V> = {
    [K in keyof V]: (
        handler: (value: V[K]) => any | Promise<any>,
        placeholder?: string
    ) => Promise<void>;
};

export function createWatchable<V extends object>(
    value: V,
    listen: (onChange: (value: V, changedKey?: string) => void) => void,
    writable?: boolean
): Watchable<V> {
    return assignAsGetter(
        value,
        {
            __watch<K extends keyof V>(
                key: K,
                onChange: (value: V[K]) => void
            ) {
                listen((value, changedKey) => {
                    if (changedKey && changedKey !== key) return;

                    onChange(value[key]);
                });
            },
            __original: value,
        },
        writable
    );
}

function arrToObj<V>(
    arr: [string, V][]
): {
    [key: string]: V;
} {
    const obj: {
        [key: string]: V;
    } = {};
    for (const [key, value] of arr) {
        obj[key] = value;
    }
    return obj;
}

const watchableDirectiveFactory = (directive: typeof litHTMLDirective) =>
    directive(
        <V>(
            getInitialValue: () => V | Promise<V>,
            onChange: (listener: (newValue: V | Promise<V>) => void) => void,
            placeholder?: string
        ) => (part: Part) => {
            let changedValueSet: boolean = false;

            const initialValue = getInitialValue();
            if (initialValue instanceof Promise) {
                initialValue.then((value) => {
                    if (changedValueSet) return;
                    part.setValue(value);
                    part.commit();
                });
                if (placeholder) {
                    part.setValue(placeholder);
                }
            } else {
                part.setValue(initialValue);
                part.commit();
            }

            onChange((newValue) => {
                changedValueSet = true;
                if (newValue instanceof Promise) {
                    newValue.then((resolved) => {
                        part.setValue(resolved);
                        part.commit();
                    });
                } else {
                    part.setValue(newValue);
                    part.commit();
                }
            });
        }
    );

/**
 * Watch the accessed key's value for changes, such that
 * whenever the underlying value is changed, the value
 * is updated in the DOM automatically.
 *
 * @template V - The value to be watched
 * @param {Watchable<V>} watchable - The value to watch
 */
export function watch<V extends object>(watchable: Watchable<V>): Watched<V> {
    const templateSettings = TemplateClass._templateSettings;
    if (!templateSettings) {
        throw new Error(
            'Watchables are not supported if WebComponentTemplateManager.initComplexTemplateProvider has not been called'
        );
    }

    const watchableDirective = watchableDirectiveFactory(
        templateSettings.directive
    );
    if (typeof Proxy === 'undefined') {
        return arrToObj(
            Object.keys(watchable)
                .filter((k) => k !== '__watch' && k !== '__original')
                .map((key: Extract<keyof V, string>) => {
                    return [
                        key,
                        watchableDirective(
                            () => watchable[key],
                            (listener) => {
                                watchable.__watch(key, (value) => {
                                    listener(
                                        value as Watchable<V>[Extract<
                                            keyof V,
                                            string
                                        >]
                                    );
                                });
                            }
                        ),
                    ];
                })
        ) as Watched<V>;
    } else {
        return (new Proxy(watchable, {
            get(_target, prop: Extract<keyof V, string>) {
                if (prop === '__watch' || prop === '__original') return void 0;
                if (!watchable.hasOwnProperty(prop)) return void 0;

                return watchableDirective(
                    () => watchable[prop],
                    (listener) => {
                        watchable.__watch(prop, (value) => {
                            listener(
                                value as Watchable<V>[Extract<keyof V, string>]
                            );
                        });
                    }
                );
            },
        }) as unknown) as Watched<V>;
    }
}

/**
 * Watch the accessed key's value for changes and call a
 * function with it. The function's return value is set to be
 * the part's value. The return value can be a promise.
 * Whenever the underlying value is changed, the function
 * is called again and the value is updated in the DOM automatically.
 * 
 * Example: 
 ```js
 watchFn(props).someProp((value) => value + '-appendix')
 ```
 *
 * @template V - The value to be watched
 * @param {Watchable<V>} watchable - The value to watch
 */
export function watchFn<V extends object>(
    watchable: Watchable<V>
): WatchedFn<V> {
    const templateSettings = TemplateClass._templateSettings;
    if (!templateSettings) {
        throw new Error(
            'Watchables are not supported if WebComponentTemplateManager.initComplexTemplateProvider has not been called'
        );
    }

    const watchableDirective = watchableDirectiveFactory(
        templateSettings.directive
    );
    if (typeof Proxy === 'undefined') {
        return (arrToObj(
            Object.keys(watchable)
                .filter((k) => k !== '__watch' && k !== '__original')
                .map((key: Extract<keyof V, string>) => {
                    return [
                        key,
                        (
                            handler: (
                                value: V[typeof key]
                            ) => any | Promise<any>,
                            placeholder?: string
                        ) => {
                            const returnValue = handler(watchable[key]);
                            return watchableDirective(
                                () => returnValue,
                                (listener) => {
                                    watchable.__watch(key, (value) => {
                                        listener(handler(value));
                                    });
                                },
                                placeholder
                            );
                        },
                    ];
                })
        ) as unknown) as WatchedFn<V>;
    } else {
        return (new Proxy(watchable, {
            get(_target, prop: Extract<keyof V, string>) {
                if (prop === '__watch' || prop === '__original') return void 0;
                if (!watchable.hasOwnProperty(prop)) return void 0;

                return (
                    handler: (value: V[typeof prop]) => any | Promise<any>,
                    placeholder?: string
                ) => {
                    const returnValue = handler(watchable[prop]);

                    return watchableDirective(
                        () => returnValue,
                        (listener) => {
                            watchable.__watch(prop, (value) => {
                                listener(handler(value));
                            });
                        },
                        placeholder
                    );
                };
            },
        }) as unknown) as WatchedFn<V>;
    }
}
