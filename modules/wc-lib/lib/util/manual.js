import { TemplateClass } from '../template-manager.js';
import { assignAsGetter } from '../base.js';
export function createWatchable(value, listen, writable) {
    return assignAsGetter(value, {
        __watch(key, onChange) {
            listen((value, changedKey) => {
                if (changedKey && changedKey !== key)
                    return;
                onChange(value[key]);
            });
        },
        __original: value,
    }, writable);
}
function arrToObj(arr) {
    const obj = {};
    for (const [key, value] of arr) {
        obj[key] = value;
    }
    return obj;
}
const watchableDirectiveFactory = (directive) => directive((getInitialValue, onChange, placeholder) => (part) => {
    let changedValueSet = false;
    const initialValue = getInitialValue();
    if (initialValue instanceof Promise) {
        initialValue.then((value) => {
            if (changedValueSet)
                return;
            part.setValue(value);
            part.commit();
        });
        if (placeholder) {
            part.setValue(placeholder);
        }
    }
    else {
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
        }
        else {
            part.setValue(newValue);
            part.commit();
        }
    });
});
/**
 * Watch the accessed key's value for changes, such that
 * whenever the underlying value is changed, the value
 * is updated in the DOM automatically.
 *
 * @template V - The value to be watched
 * @param {Watchable<V>} watchable - The value to watch
 */
export function watch(watchable) {
    const templateSettings = TemplateClass._templateSettings;
    if (!templateSettings) {
        throw new Error('Watchables are not supported if WebComponentTemplateManager.initComplexTemplateProvider has not been called');
    }
    const watchableDirective = watchableDirectiveFactory(templateSettings.directive);
    if (typeof Proxy === 'undefined') {
        return arrToObj(Object.keys(watchable)
            .filter((k) => k !== '__watch' && k !== '__original')
            .map((key) => {
            return [
                key,
                watchableDirective(() => watchable[key], (listener) => {
                    watchable.__watch(key, (value) => {
                        listener(value);
                    });
                }),
            ];
        }));
    }
    else {
        return new Proxy(watchable, {
            get(_target, prop) {
                if (prop === '__watch' || prop === '__original')
                    return void 0;
                if (!watchable.hasOwnProperty(prop))
                    return void 0;
                return watchableDirective(() => watchable[prop], (listener) => {
                    watchable.__watch(prop, (value) => {
                        listener(value);
                    });
                });
            },
        });
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
export function watchFn(watchable) {
    const templateSettings = TemplateClass._templateSettings;
    if (!templateSettings) {
        throw new Error('Watchables are not supported if WebComponentTemplateManager.initComplexTemplateProvider has not been called');
    }
    const watchableDirective = watchableDirectiveFactory(templateSettings.directive);
    if (typeof Proxy === 'undefined') {
        return arrToObj(Object.keys(watchable)
            .filter((k) => k !== '__watch' && k !== '__original')
            .map((key) => {
            return [
                key,
                (handler, placeholder) => {
                    const returnValue = handler(watchable[key]);
                    return watchableDirective(() => returnValue, (listener) => {
                        watchable.__watch(key, (value) => {
                            listener(handler(value));
                        });
                    }, placeholder);
                },
            ];
        }));
    }
    else {
        return new Proxy(watchable, {
            get(_target, prop) {
                if (prop === '__watch' || prop === '__original')
                    return void 0;
                if (!watchable.hasOwnProperty(prop))
                    return void 0;
                return (handler, placeholder) => {
                    const returnValue = handler(watchable[prop]);
                    return watchableDirective(() => returnValue, (listener) => {
                        watchable.__watch(prop, (value) => {
                            listener(handler(value));
                        });
                    }, placeholder);
                };
            },
        });
    }
}
//# sourceMappingURL=manual.js.map