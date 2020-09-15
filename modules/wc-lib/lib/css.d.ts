import { IDMapFn, SelectorMap } from './component.js';
declare type InferSelectors<C> = C extends {
    $: IDMapFn<infer IDS>;
} ? IDS : {
    IDS: {};
    CLASSES: {};
    TAGS: {};
    TOGGLES: string;
    ATTRIBUTES: string;
};
declare type DefaultStr<S> = S extends undefined ? string : S;
declare type DefaultObj<S> = S extends undefined ? {} : S;
declare abstract class AllCSSMap<S extends SelectorMap> {
    private _onValue?;
    constructor(_onValue?: ((sel: CSSSelector<S, any, any, any>) => CSSSelector<S, any, any, any>) | undefined);
    _genProxy<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES' | 'ATTRIBUTES'>, M extends {
        [key: string]: any;
    }>(prefix: string): {
        [K in keyof M]: CSSSelector<S, T, M, K>;
    };
    /**
     * An object where the keys are valid ID selectors and
     * the values are instances of the `CSSSelector` class,
     * off of which additional chaining can happen.
     *
     * Synonyms are `i` and `id`
     */
    $: { [K in keyof DefaultObj<S["IDS"]>]: CSSSelector<S, "IDS", DefaultObj<S["IDS"]>, K>; };
    /**
     * An object where the keys are valid ID selectors and
     * the values are instances of the `CSSSelector` class,
     * off of which additional chaining can happen.
     *
     * Synonyms are `$` and `id`
     */
    i: { [K in keyof DefaultObj<S["IDS"]>]: CSSSelector<S, "IDS", DefaultObj<S["IDS"]>, K>; };
    /**
     * An object where the keys are valid ID selectors and
     * the values are instances of the `CSSSelector` class,
     * off of which additional chaining can happen.
     *
     * Synonyms are `$` and `i`
     */
    id: { [K in keyof DefaultObj<S["IDS"]>]: CSSSelector<S, "IDS", DefaultObj<S["IDS"]>, K>; };
    /**
     * An object where the keys are valid class selectors and
     * the values are instances of the `CSSSelector` class,
     * off of which additional chaining can happen.
     *
     * Synonym is `c`
     */
    class: { [K in keyof DefaultObj<S["CLASSES"]>]: CSSSelector<S, "CLASSES", DefaultObj<S["CLASSES"]>, K>; };
    /**
     * An object where the keys are valid class selectors and
     * the values are instances of the `CSSSelector` class,
     * off of which additional chaining can happen.
     *
     * Synonym is `class`
     */
    c: { [K in keyof DefaultObj<S["CLASSES"]>]: CSSSelector<S, "CLASSES", DefaultObj<S["CLASSES"]>, K>; };
    /**
     * An object where the keys are valid tag selectors and
     * the values are instances of the `CSSSelector` class,
     * off of which additional chaining can happen.
     *
     * Synonym is `t`
     */
    tag: { [K in keyof DefaultObj<S["TAGS"]>]: CSSSelector<S, "TAGS", DefaultObj<S["TAGS"]>, K>; };
    /**
     * An object where the keys are valid tag selectors and
     * the values are instances of the `CSSSelector` class,
     * off of which additional chaining can happen.
     *
     * Synonym is `tag`
     */
    t: { [K in keyof DefaultObj<S["TAGS"]>]: CSSSelector<S, "TAGS", DefaultObj<S["TAGS"]>, K>; };
}
declare class DiffSelectorClass<S extends SelectorMap> extends AllCSSMap<S> {
    constructor(onValue: (sel: CSSSelector<S, any, any, any>) => CSSSelector<S, any, any, any>);
}
declare type ToggleFn<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES' | 'ATTRIBUTES'>, ST extends SelectorMap[T], N extends keyof ST> = {
    [K in DefaultStr<S['TOGGLES']>]: CSSSelector<S, T, ST, N>;
};
declare type AttrFn<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES' | 'ATTRIBUTES'>, ST extends SelectorMap[T], N extends keyof ST> = {
    [K in DefaultStr<S['ATTRIBUTES']>]: CSSSelector<S, T, ST, N>;
};
/**
 * A class with which the previously obtained selector can be
 * expanded
 *
 * @template S - The selector map associated with the current
 * 	component
 * @template T - The type of the current selector (id, class or tag)
 * @template ST - The keys of the current type of selector (equal to `S[T]`)
 * @template N - The name of the current selector (a key of `S[T]`)
 */
declare class CSSSelector<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES' | 'ATTRIBUTES'>, ST extends SelectorMap[T], N extends keyof ST> {
    private _selector;
    private _prefix;
    private _andGroup;
    private _orSelectors;
    private _childSelectors;
    private _descendantSelectors;
    private _toggles;
    private _attrs;
    private _pseudo;
    constructor(_selector: N, _prefix: string);
    private _and;
    /**
     * An object where the keys are valid class selectors that can
     * be added to the current selector and the values are
     * new instances of `CSSSelector`.
     *
     * For example:
     * ```js
     * css(this).id.a.and.b === '#a.b'
     * css(this).id.a.and.b.and.c.and.d === '#a.b.c.d
     * ```
     */
    and: { [K in keyof DefaultObj<S["CLASSES"]>]: CSSSelector<S, "CLASSES", DefaultObj<S["CLASSES"]>, K>; };
    private _registerDiffSelector;
    /**
     * Used to create selector strings that apply to multiple selectors.
     * This is an object where the keys are the basic selector types again
     * and the values are their respective key-value maps.
     *
     * Example:
     * ```js
     * css(this).id.a.or.id.b === '#a, #b'
     * css(this).id.a.or.class.c === '#a, .c'
     * ```
     */
    or: DiffSelectorClass<S>;
    /**
     * Used to create selector strings that apply to multiple selectors.
     * This is a function that takes other instances of the `CSSSelector`
     * class and joins them to the current list
     *
     * Example:
     * ```js
     * css(this).id.a.orFn(css(this).id.b) === '#a, #b'
     * css(this).id.a.orFn(css(this).class.c) === '#a, .c'
     * ```
     *
     * @template T - The current type of selector (id, class or tag)
     * @template ST - The keys related to the current type of selector
     * @template N - The current selector string
     *
     * @param {CSSSelector<S, T, ST, N>} sel - The selector to add
     *
     * @returns {CSSSelector<S, T, ST, N>} The passed selector
     */
    orFn<T extends Exclude<keyof SelectorMap, 'TOGGLES' | 'ATTRIBUTES'>, ST extends SelectorMap[T], N extends keyof ST>(sel: CSSSelector<S, T, ST, N>): CSSSelector<S, T, ST, N>;
    /**
     * Used to create selectors with direct children
     * This is an object where the keys are the basic selector types again
     * and the values are their respective key-value maps.
     *
     * Example:
     * ```js
     * css(this).id.a.child.id.b === '#a > #b'
     * css(this).id.a.child.class.c === '#a > .c'
     * css(this).id.a.and.b.child.class.c === '#a.b > .c'
     * css(this).id.a.or.class.b.child.class.c === '#a, .b > .c'
     * ```
     */
    child: DiffSelectorClass<S>;
    /**
     * Used to create selectors with descendants (non-direct children)
     * This is an object where the keys are the basic selector types again
     * and the values are their respective key-value maps.
     *
     * Example:
     * ```js
     * css(this).id.a.descendant.id.b === '#a #b'
     * css(this).id.a.descendant.class.c === '#a .c'
     * css(this).id.a.and.b.descendant.class.c === '#a.b .c'
     * css(this).id.a.or.class.b.descendant.class.c === '#a, .b .c'
     * ```
     */
    descendant: DiffSelectorClass<S>;
    /**
     * Used to toggle on or off classes
     * An object where the keys are togglable classes
     * defined in the selectors object (see example).
     * Returns this same `CSSSelector` instance.
     *
     * Examples:
     * ```js
     * class MyClass extends ConfigurableWebComponent<{
     *     selectors: {
     *         IDS: {
     *             "someid": HTMLDivElement;
     *             "otherid": HTMLDivElement;
     *         };
     *         TOGGLES: "someclas"|"otherclass";
     *     }
     * }> {};
     *
     * css(this).id.someid.toggle === { "someclass": ..., "otherclass": ... } // Suggestions
     * css(this).id.someid.toggle.someclass === '#id.someclass'
     * css(this).id.someid.toggle.someclass.toggle.otherclass === '#id.someclass.otherclass'
     * ```
     */
    toggle: ToggleFn<S, T, ST, N>;
    /**
     * Used to toggle on or off classes
     * A function that takes any number of toggled classes.
     * Returns this same `CSSSelector` instance.
     *
     * Examples:
     * ```js
     * class MyClass extends ConfigurableWebComponent<{
     *     selectors: {
     *         IDS: {
     *             "someid": HTMLDivElement;
     *             "otherid": HTMLDivElement;
     *         };
     *         TOGGLES: "someclass"|"otherclass";
     *     }
     * }> {};
     *
     * css(this).id.someid.toggleFn('someclass') === '#id.someclass'
     * css(this).id.someid.toggleFn('someclass', 'otherclass') === '#id.someclass.otherclass'
     * ```
     *
     * @param {DefaultToggleableObj<S['TOGGLES']>[T][N][]} toggles - Valid
     * 	toggles for the current selector. Can be any number of toggles
     *
     * @returns this
     */
    toggleFn(...toggles: S['TOGGLES'][]): this;
    /**
     * Used to set attributes and their values on this selector.
     * Passed attribute can be any string defined in selectors['ATTRIBUTES']
     * Returns this same `CSSSelector` instance.
     * Note that this does not allow the setting of values, for that use
     * `attrFn(key, value)`.
     *
     * Examples:
     * ```js
     * class MyClass extends ConfigurableWebComponent<{
     *     selectors: {
     *         IDS: {
     *             "someid": HTMLDivElement;
     *             "otherid": HTMLDivElement;
     *         };
     *         ATTRIBUTES: 'someattr';
     *     }
     * }> {};
     *
     * css(this).id.someid.attr.someattr === '#id[someattr]'
     * ```
     */
    attr: AttrFn<S, T, ST, N>;
    /**
     * Used to set attributes and their values on this selector.
     * Passed attribute can be any string defined in selectors['ATTRIBUTES']
     * Value can optionally be passed to give it a value.
     * Returns this same `CSSSelector` instance.
     *
     * Examples:
     * ```js
     * class MyClass extends ConfigurableWebComponent<{
     *     selectors: {
     *         IDS: {
     *             "someid": HTMLDivElement;
     *             "otherid": HTMLDivElement;
     *         };
     *         ATTRIBUTES: 'someattr'
     *     }
     * }> {};
     *
     * css(this).id.someid.attrFn('someattr') === '#id[someattr]'
     * css(this).id.someid.attrFn('someattr', 'value') === '#id[someattr="value"]'
     * ```
     *
     * @param {DefaultToggleableObj<S['ATTRIBUTES']>[T][N]} attr - The name
     * 	of a valid attribute for this selector
     * @param {any} [value] - A value for the passed attribute
     *
     * @returns {this} - Return this again
     */
    attrFn(attr: S['ATTRIBUTES'], value?: any): this;
    /**
     * A function that applies any passed pseudo selectors to this selector.
     * Returns this again.
     *
     * For example:
     * ```js
     * css(this).$.a.pseudo('hover') === '#a:hover'
     * css(this).$.a.pseudo('hover', 'visited') === '#a:hover:visited'
     * ```
     *
     * @param {string[]} selector - Pseudo selectors
     *
     * @returns {this} - Returns this again
     */
    pseudo(...selector: string[]): this;
    private _collapseDiffSelector;
    private _toString;
    /**
     * Converts this selector to a string. This is done implicitly
     * by the templater so you shouldn't have to call this manually.
     * However it can be handy for debugging or just checking how
     * this works.
     *
     * @returns {string} - The stringified version of this selector
     */
    toString(): string;
}
/**
 * A class from which basic selectors (IDs, classes and tags)
 * can be chained off of
 *
 * @template S - The selector map associated with the used component
 */
declare class CSS<S extends SelectorMap> extends AllCSSMap<S> {
}
/**
 * Returns a chainable css selector generator that is eventually
 * converted to a string. Pass either a template type (i.e. `css<MyClass>()`)
 * or an argument (i.e. `css(this)`) for typing. Sources typings from
 * class' `selectors` type argument
 * (`class MyClass extends ConfigurableWebComponent<{ selectors: ... }>`)
 *
 * @template C - The component that will eventually contain this CSS
 *
 * @param {C} [_c] - An optional argument from which typing info is
 * 	inferred. If not passed, attempts to source info from template
 * 	type (i.e. `css<MyClass>()`)
 *
 * @returns {CSS<InferSelectors<C>>} A chainable CSS selector
 * 	generated with types based on the passed component/type
 */
export declare function css<C>(_c?: C): CSS<InferSelectors<C>>;
export {};
//# sourceMappingURL=css.d.ts.map