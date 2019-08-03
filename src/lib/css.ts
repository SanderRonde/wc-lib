import { IDMapFn, SelectorMap } from './component.js';

type InferSelectors<C> = C extends {
	$: IDMapFn<infer IDS>
} ? IDS : {
	IDS: {};
	CLASSES: {};
	TAGS: {};
	TOGGLES: {};
	ATTRIBUTES: {};
};

type DefaultObj<S> = S extends undefined ? {} : S;
type DefaultToggleableObj<S> = S extends undefined ? {
	IDS: {};
	CLASSES: {};
	TAGS: {};
} : S;

abstract class AllCSSMap<S extends SelectorMap> {
	constructor(private _onValue?: (sel: CSSSelector<S, any, any, any>) => CSSSelector<S, any, any, any>) { }
	
	_genProxy<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES'|'ATTRIBUTES'>, M extends {
		[key: string]: any;
	}>(prefix: string): {
			[K in keyof M]: CSSSelector<S, T, M, K>;
		} {
			return genProxy<S, T, M>(prefix, this._onValue);
		}

	/**
	 * An object where the keys are valid ID selectors and
	 * the values are instances of the `CSSSelector` class,
	 * off of which additional chaining can happen.
	 * 
	 * Synonyms are `i` and `id`
	 */
	$ = this._genProxy<S, 'IDS', DefaultObj<S['IDS']>>('#');
	/**
	 * An object where the keys are valid ID selectors and
	 * the values are instances of the `CSSSelector` class,
	 * off of which additional chaining can happen.
	 * 
	 * Synonyms are `$` and `id`
	 */
	i = this.$;
	/**
	 * An object where the keys are valid ID selectors and
	 * the values are instances of the `CSSSelector` class,
	 * off of which additional chaining can happen.
	 * 
	 * Synonyms are `$` and `i`
	 */
	id = this.$;

	/**
	 * An object where the keys are valid class selectors and
	 * the values are instances of the `CSSSelector` class,
	 * off of which additional chaining can happen.
	 * 
	 * Synonym is `c`
	 */
	class = this._genProxy<S, 'CLASSES', DefaultObj<S['CLASSES']>>('.');
	/**
	 * An object where the keys are valid class selectors and
	 * the values are instances of the `CSSSelector` class,
	 * off of which additional chaining can happen.
	 * 
	 * Synonym is `class`
	 */
	c = this.class;

	/**
	 * An object where the keys are valid tag selectors and
	 * the values are instances of the `CSSSelector` class,
	 * off of which additional chaining can happen.
	 * 
	 * Synonym is `t`
	 */
	tag = this._genProxy<S, 'TAGS', DefaultObj<S['TAGS']>>('');
	/**
	 * An object where the keys are valid tag selectors and
	 * the values are instances of the `CSSSelector` class,
	 * off of which additional chaining can happen.
	 * 
	 * Synonym is `tag`
	 */
	t = this.tag;
}

function genProxy<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES'|'ATTRIBUTES'>, M extends {
	[key: string]: any;
}>(prefix: string, preRet?: (sel: CSSSelector<S, T, M, any>) => CSSSelector<S, T, any, any>): {
		[K in keyof M]: CSSSelector<S, T, M, K>;
	} {
		return new Proxy({}, {
			get(_, selector) {
				const cls = new CSSSelector<S, T, M, any>(
					typeof selector === 'string' ? selector : '?', prefix);
				return preRet ? preRet(cls) : cls;
			}
		}) as {
			[K in keyof M]: CSSSelector<S, T, M, K>;
		};
}

class DiffSelectorClass<S extends SelectorMap> extends AllCSSMap<S> {
	constructor(onValue: (sel: CSSSelector<S, any, any, any>) => CSSSelector<S, any, any, any>) {
		super(onValue);
	}
}

type ToggleFn<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES'|'ATTRIBUTES'>, ST extends SelectorMap[T], N extends keyof ST> = {
	// @ts-ignore
	[K in DefaultToggleableObj<S['TOGGLES']>[T][N]]: CSSSelector<S, T, ST, N>;
}

type AttrFn<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES'|'ATTRIBUTES'>, ST extends SelectorMap[T], N extends keyof ST> = {
	// @ts-ignore
	[K in DefaultToggleableObj<S['ATTRIBUTES']>[T][N]]: CSSSelector<S, T, ST, N>;
}

interface DiffSelector<S extends SelectorMap> {
	parent: CSSSelector<S, any, any, any>|null;
	group: CSSSelector<S, any, any, any>[];
	name: '_orSelectors'|'_childSelectors'|'_descendantSelectors';
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
class CSSSelector<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES'|'ATTRIBUTES'>, ST extends SelectorMap[T], N extends keyof ST> {
	private _andGroup: CSSSelector<S, any, any, any>[] = [];
	private _orSelectors: DiffSelector<S> = {
		parent: null,
		group: [],
		name: '_orSelectors'
	}
	private _childSelectors: DiffSelector<S> = {
		parent: null,
		group: [],
		name: '_childSelectors'
	}
	private _descendantSelectors: DiffSelector<S> = {
		parent: null,
		group: [],
		name: '_descendantSelectors'
	}
	private _toggles: string[] = [];
	private _attrs: {
		key: string;
		value?: any;
	}[] = [];
	private _pseudo: string[] = [];

	constructor(private _selector: N, private _prefix: string) { }

	private _and(sel: CSSSelector<S, any, any, any>) {
		this._andGroup.push(sel);
	}

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
	and = genProxy<S, 'CLASSES', DefaultObj<S['CLASSES']>>('.', (sel) => {
		this._and(sel);
		return this;
	}) as {
		[K in keyof DefaultObj<S['CLASSES']>]: CSSSelector<S, 'CLASSES', DefaultObj<S['CLASSES']>, K>;
	};

	private _registerDiffSelector(container: DiffSelector<S>, selector: CSSSelector<S, any, any, any>) {
		let parent: CSSSelector<S, any, any, any> = this;
		while (parent[container.name].parent) {
			parent = parent[container.name].parent!;
		}
		parent[container.name].group.push(
			selector, 
			...selector[container.name].group,
			...selector[container.name].parent ? 
				[
					...selector[container.name].parent![container.name].group, 
					selector[container.name].parent!
				] : []
			);
		parent[container.name].group = parent[container.name].group
			.filter((v, i, a) => a.indexOf(v) === i);
		selector[container.name].parent = this;
	}

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
	or = new DiffSelectorClass<S>((sel) => {
		this._registerDiffSelector(this._orSelectors, sel);
		return sel;
	});

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
	orFn<T extends Exclude<keyof SelectorMap, 'TOGGLES'|'ATTRIBUTES'>, ST extends SelectorMap[T], N extends keyof ST>(
		sel: CSSSelector<S, T, ST, N>): CSSSelector<S, T, ST, N> {
			this._registerDiffSelector(this._orSelectors, sel);
			return sel;
		}

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
	child = new DiffSelectorClass<S>((sel) => {
		this._registerDiffSelector(this._childSelectors, sel);
		return sel;
	});

	/**
	 * Used to create selectors with descenants (non-direct children)
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
	descendant = new DiffSelectorClass<S>((sel) => {
		this._registerDiffSelector(this._descendantSelectors, sel);
		return sel;
	});

	/**
	 * Used to toggle on or off classes
	 * An object where the keys are valid classes for the current selector.
	 * The current selector is based off of the last chained element
	 * and the valid classes are selected from the `TOGGLES` key of the
	 * class' selector type. Returns this same `CSSSelector` instance.
	 * 
	 * Examples:
	 * ```js
	 * class MyClass extends ConfigurableWebComponent<{
	 *     selectors: {
	 *         IDS: {
	 *             "someid": HTMLDivElement;
	 *             "otherid": HTMLDivElement;
	 *         };
	 *         TOGGLES: {
	 *             IDS: {
	 *                 "someid": "someclas"|"otherclass"
	 *             }
	 *         }
	 *     }
	 * }> {};
	 * 
	 * css(this).id.otherid.toggle === {} // No suggestions since there are no toggles
	 * css(this).id.someid.toggle === { "someclass": ..., "otherclass": ... } // Suggestions
	 * css(this).id.someid.toggle.someclass === '#id.someclass'
	 * css(this).id.someid.toggle.someclass.toggle.otherclass === '#id.someclass.otherclass'
	 * ```
	 */
	toggle = new Proxy({}, {
		get: (_, key) => {
			if (typeof key === 'string') {
				this._toggles.push(key);
			} else {
				this._toggles.push('?');
			}
			return this;
		}
	}) as unknown as ToggleFn<S, T, ST, N>;

	/**
	 * Used to toggle on or off classes
	 * An function that takes any number of valid toggled classes for 
	 * the current selector. The current selector is based off of the 
	 * last chained element and the valid classes are selected from 
	 * the `TOGGLES` key of the class' selector type. Returns this 
	 * same `CSSSelector` instance.
	 * 
	 * Examples:
	 * ```js
	 * class MyClass extends ConfigurableWebComponent<{
	 *     selectors: {
	 *         IDS: {
	 *             "someid": HTMLDivElement;
	 *             "otherid": HTMLDivElement;
	 *         };
	 *         TOGGLES: {
	 *             IDS: {
	 *                 "someid": "someclas"|"otherclass"
	 *             }
	 *         }
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
	//@ts-ignore
	toggleFn(...toggles: DefaultToggleableObj<S['TOGGLES']>[T][N][]): this {
		this._toggles.push(...toggles as unknown as string);
		return this;
	};

	/**
	 * Used to set valid attributes on this selector.
	 * The current selector is based off of the last chained element
	 * and the valid attributes are selected from the `ATTRIBUTES` key of
	 * the class' selector type. Returns this same `CSSSelector` instance.
	 * Note that this does not allow the settin of values, for that use
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
	 *         ATTRIBUTES: {
	 *             IDS: {
	 *                 "someid": "someattr"
	 *             }
	 *         }
	 *     }
	 * }> {};
	 * 
	 * css(this).id.someid.attr.someattr === '#id[someattr]'
	 * ```
	 */
	attr = new Proxy({}, {
		get: (_, key) => {
			if (typeof key === 'string') {
				this._attrs.push({ key });
			} else {
				this._attrs.push({ key: '?' });
			}
			return this;
		}
	}) as unknown as AttrFn<S, T, ST, N>;;

	/**
	 * Used to set valid attributes and their values on this selector.
	 * The current selector is based off of the last chained element
	 * and the valid attributes are selected from the `ATTRIBUTES` key of
	 * the class' selector type. Returns this same `CSSSelector` instance.
	 * 
	 * Examples:
	 * ```js
	 * class MyClass extends ConfigurableWebComponent<{
	 *     selectors: {
	 *         IDS: {
	 *             "someid": HTMLDivElement;
	 *             "otherid": HTMLDivElement;
	 *         };
	 *         ATTRIBUTES: {
	 *             IDS: {
	 *                 "someid": "someattr"
	 *             }
	 *         }
	 *     }
	 * }> {};
	 * 
	 * css(this).id.someid.attr.someattr === '#id[someattr]'
	 * ```
	 * 
	 * @param {DefaultToggleableObj<S['ATTRIBUTES']>[T][N]} attr - The name
	 * 	of a valid attribute for this selector
	 * @param {any} [value] - A value for the passed attribute
	 * 
	 * @returns {this} - Return this again
	 */
	//@ts-ignore
	attrFn(attr: DefaultToggleableObj<S['ATTRIBUTES']>[T][N], value?: any): this {
		this._attrs.push({ key: attr as unknown as string, value });
		return this;
	};

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
	pseudo(...selector: string[]): this {
		this._pseudo.push(...selector);
		return this;
	}

	private _collapseDiffSelector(group: DiffSelector<S>, 
		ignore: WeakSet<CSSSelector<S, any, any, any>>): {
			pre: string|null;
			post: (string|null)[];
		} {
			return {
				pre: this[group.name].parent ?
					this[group.name].parent!._toString(ignore) : null,
				post: this[group.name].group.map(o => o._toString(ignore))
			}
		}

	private _toString(): string;
	private _toString(ignore: WeakSet<CSSSelector<S, any, any, any>>): string|null;
	private _toString(ignore: WeakSet<CSSSelector<S, any, any, any>> = new WeakSet()): string|null {
		if (ignore.has(this)) return null;
		ignore.add(this);

		// Generate the own selector first
		const ownSelector = `${this._prefix}${this._selector}`;
		// Then add any toggles
		const toggles = this._toggles.map(t => `.${t}`).join('');
		// Then any attributes
		const attributes = this._attrs.map(({key, value}) => {
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

		const { pre: orPre, post: orPost } = this._collapseDiffSelector(
			this._orSelectors, ignore);
		const { pre: childPre, post: childPost } = this._collapseDiffSelector(
			this._childSelectors, ignore);
		const { pre: descendantPre, post: descendantPost } = this._collapseDiffSelector(
			this._descendantSelectors, ignore);

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
	toString(): string {
		return this._toString();
	}
}

/**
 * A class from which basic selectors (IDs, classes and tags)
 * can be chained off of
 * 
 * @template S - The selector map associated with the used component
 */
class CSS<S extends SelectorMap> extends AllCSSMap<S> { }

let cssInstance: CSS<any>|null = null;
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
export function css<C>(_c?: C): CSS<InferSelectors<C>> {
	try {
		if (cssInstance) {
			return cssInstance as CSS<InferSelectors<C>>;
		}
		return (cssInstance = new CSS()) as CSS<InferSelectors<C>>;
	} catch(e) {
		console.log('throwing');
		throw new Error('Attempting to use css map while proxy is not supported');
	}
}