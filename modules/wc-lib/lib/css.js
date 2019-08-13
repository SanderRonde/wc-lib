class AllCSSMap {
    constructor(_onValue) {
        this._onValue = _onValue;
        /**
         * An object where the keys are valid ID selectors and
         * the values are instances of the `CSSSelector` class,
         * off of which additional chaining can happen.
         *
         * Synonyms are `i` and `id`
         */
        this.$ = this._genProxy('#');
        /**
         * An object where the keys are valid ID selectors and
         * the values are instances of the `CSSSelector` class,
         * off of which additional chaining can happen.
         *
         * Synonyms are `$` and `id`
         */
        this.i = this.$;
        /**
         * An object where the keys are valid ID selectors and
         * the values are instances of the `CSSSelector` class,
         * off of which additional chaining can happen.
         *
         * Synonyms are `$` and `i`
         */
        this.id = this.$;
        /**
         * An object where the keys are valid class selectors and
         * the values are instances of the `CSSSelector` class,
         * off of which additional chaining can happen.
         *
         * Synonym is `c`
         */
        this.class = this._genProxy('.');
        /**
         * An object where the keys are valid class selectors and
         * the values are instances of the `CSSSelector` class,
         * off of which additional chaining can happen.
         *
         * Synonym is `class`
         */
        this.c = this.class;
        /**
         * An object where the keys are valid tag selectors and
         * the values are instances of the `CSSSelector` class,
         * off of which additional chaining can happen.
         *
         * Synonym is `t`
         */
        this.tag = this._genProxy('');
        /**
         * An object where the keys are valid tag selectors and
         * the values are instances of the `CSSSelector` class,
         * off of which additional chaining can happen.
         *
         * Synonym is `tag`
         */
        this.t = this.tag;
    }
    _genProxy(prefix) {
        return genProxy(prefix, this._onValue);
    }
}
function genProxy(prefix, preRet) {
    return new Proxy({}, {
        get(_, selector) {
            const cls = new CSSSelector(typeof selector === 'string' ? selector : '?', prefix);
            return preRet ? preRet(cls) : cls;
        }
    });
}
class DiffSelectorClass extends AllCSSMap {
    constructor(onValue) {
        super(onValue);
    }
}
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
class CSSSelector {
    constructor(_selector, _prefix) {
        this._selector = _selector;
        this._prefix = _prefix;
        this._andGroup = [];
        this._orSelectors = {
            parent: null,
            group: [],
            name: '_orSelectors'
        };
        this._childSelectors = {
            parent: null,
            group: [],
            name: '_childSelectors'
        };
        this._descendantSelectors = {
            parent: null,
            group: [],
            name: '_descendantSelectors'
        };
        this._toggles = [];
        this._attrs = [];
        this._pseudo = [];
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
        this.and = genProxy('.', (sel) => {
            this._and(sel);
            return this;
        });
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
        this.or = new DiffSelectorClass((sel) => {
            this._registerDiffSelector(this._orSelectors, sel);
            return sel;
        });
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
        this.child = new DiffSelectorClass((sel) => {
            this._registerDiffSelector(this._childSelectors, sel);
            return sel;
        });
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
        this.descendant = new DiffSelectorClass((sel) => {
            this._registerDiffSelector(this._descendantSelectors, sel);
            return sel;
        });
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
        this.toggle = new Proxy({}, {
            get: (_, key) => {
                if (typeof key === 'string') {
                    this._toggles.push(key);
                }
                else {
                    this._toggles.push('?');
                }
                return this;
            }
        });
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
        this.attr = new Proxy({}, {
            get: (_, key) => {
                if (typeof key === 'string') {
                    this._attrs.push({ key });
                }
                else {
                    this._attrs.push({ key: '?' });
                }
                return this;
            }
        });
    }
    _and(sel) {
        this._andGroup.push(sel);
    }
    _registerDiffSelector(container, selector) {
        let parent = this;
        while (parent[container.name].parent) {
            parent = parent[container.name].parent;
        }
        parent[container.name].group.push(selector, ...selector[container.name].group, ...selector[container.name].parent ?
            [
                ...selector[container.name].parent[container.name].group,
                selector[container.name].parent
            ] : []);
        parent[container.name].group = parent[container.name].group
            .filter((v, i, a) => a.indexOf(v) === i);
        selector[container.name].parent = this;
    }
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
    orFn(sel) {
        this._registerDiffSelector(this._orSelectors, sel);
        return sel;
    }
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
    toggleFn(...toggles) {
        this._toggles.push(...toggles);
        return this;
    }
    ;
    ;
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
    attrFn(attr, value) {
        this._attrs.push({ key: attr, value });
        return this;
    }
    ;
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
    pseudo(...selector) {
        this._pseudo.push(...selector);
        return this;
    }
    _collapseDiffSelector(group, ignore) {
        return {
            pre: this[group.name].parent ?
                this[group.name].parent._toString(ignore) : null,
            post: this[group.name].group.map(o => o._toString(ignore))
        };
    }
    _toString(ignore = new WeakSet()) {
        if (ignore.has(this))
            return null;
        ignore.add(this);
        // Generate the own selector first
        const ownSelector = `${this._prefix}${this._selector}`;
        // Then add any toggles
        const toggles = this._toggles.map(t => `.${t}`).join('');
        // Then any attributes
        const attributes = this._attrs.map(({ key, value }) => {
            if (value === void 0) {
                return `[${key}]`;
            }
            return `[${key}="${value}"]`;
        }).join('');
        // Then any pseudo selectors
        const pseudo = this._pseudo.map(p => `:${p}`).join('');
        // Then any ands
        const ands = this._andGroup.map(a => a._toString(ignore)).join('');
        const andGroupSelector = `${ownSelector}${toggles}${attributes}${pseudo}${ands}`;
        const { pre: orPre, post: orPost } = this._collapseDiffSelector(this._orSelectors, ignore);
        const { pre: childPre, post: childPost } = this._collapseDiffSelector(this._childSelectors, ignore);
        const { pre: descendantPre, post: descendantPost } = this._collapseDiffSelector(this._descendantSelectors, ignore);
        return [
            descendantPre,
            [
                childPre,
                [
                    orPre,
                    andGroupSelector,
                    ...orPost
                ].filter(i => i !== null).join(', '),
                ...childPost
            ].filter(i => i !== null).join(' > '),
            ...descendantPost
        ].filter(i => i !== null).join(' ');
    }
    /**
     * Converts this selector to a string. This is done implicitly
     * by the templater so you shouldn't have to call this manually.
     * However it can be handy for debugging or just checking how
     * this works.
     *
     * @returns {string} - The stringified version of this selector
     */
    toString() {
        return this._toString();
    }
}
/**
 * A class from which basic selectors (IDs, classes and tags)
 * can be chained off of
 *
 * @template S - The selector map associated with the used component
 */
class CSS extends AllCSSMap {
}
let cssInstance = null;
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
export function css(_c) {
    try {
        if (cssInstance) {
            return cssInstance;
        }
        return (cssInstance = new CSS());
    }
    catch (e) {
        // This is covered but is a bit hard to test
        // istanbul ignore next
        throw new Error('Attempting to use css map while proxy is not supported');
    }
}
//# sourceMappingURL=css.js.map