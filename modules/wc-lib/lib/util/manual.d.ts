import { DirectiveFn } from 'lit-html';
export declare type Watchable<T extends Object> = T & {
    __watch<K extends keyof T>(key: K, onChange: (value: T[K]) => void): void;
};
export declare type Watched<V> = {
    [K in keyof V]: DirectiveFn;
};
export declare type WatchedFn<V> = {
    [K in keyof V]: (handler: (value: V[K]) => any | Promise<any>, placeholder?: string) => Promise<void>;
};
export declare function createWatchable<V extends object>(value: V, listen: (onChange: (value: V, changedKey?: string) => void) => void, writable?: boolean): Watchable<V>;
/**
 * Watch the accessed key's value for changes, such that
 * whenever the underlying value is changed, the value
 * is updated in the DOM automatically.
 *
 * @template V - The value to be watched
 * @param {Watchable<V>} watchable - The value to watch
 */
export declare function watch<V extends object>(watchable: Watchable<V>): Watched<V>;
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
export declare function watchFn<V extends object>(watchable: Watchable<V>): WatchedFn<V>;
//# sourceMappingURL=manual.d.ts.map