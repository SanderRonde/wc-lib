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

	$ = this._genProxy<S, 'IDS', DefaultObj<S['IDS']>>('#');
	i = this.$;
	id = this.$;

	class = this._genProxy<S, 'CLASSES', DefaultObj<S['CLASSES']>>('.');
	c = this.class;

	tag = this._genProxy<S, 'TAGS', DefaultObj<S['TAGS']>>('');
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

	or = new DiffSelectorClass<S>((sel) => {
		this._registerDiffSelector(this._orSelectors, sel);
		return sel;
	});
	orFn<T extends Exclude<keyof SelectorMap, 'TOGGLES'|'ATTRIBUTES'>, ST extends SelectorMap[T], N extends keyof ST>(
		sel: CSSSelector<S, T, ST, N>): CSSSelector<S, T, ST, N> {
			this._registerDiffSelector(this._orSelectors, sel);
			return sel;
		}

	child = new DiffSelectorClass<S>((sel) => {
		this._registerDiffSelector(this._childSelectors, sel);
		return sel;
	});

	descendant = new DiffSelectorClass<S>((sel) => {
		this._registerDiffSelector(this._descendantSelectors, sel);
		return sel;
	});

	toggle = new Proxy({}, {
		get: (_, key) => {
			if (typeof key === 'string') {
				this._toggles.push(key);
			} else {
				this._toggles.push('?');
			}
			return this;
		}
	}) as unknown as ToggleFn<S, T, ST, N>;;
	//@ts-ignore
	toggleFn(...toggles: DefaultToggleableObj<S['TOGGLES']>[T][N][]): CSSSelector<S, T, ST, N> {
		this._toggles.push(...toggles as unknown as string);
		return this;
	};

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
	//@ts-ignore
	attrFn(attr: DefaultToggleableObj<S['ATTRIBUTES']>[T][N], value?: any): CSSSelector<S, T, ST, N> {
		this._attrs.push({ key: attr as unknown as string, value });
		return this;
	};

	pseudo(...selector: string[]) {
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
					this[group.name].parent!.toString(ignore) : null,
				post: this[group.name].group.map(o => o.toString(ignore))
			}
		}

	toString(): string;
	toString(ignore: WeakSet<CSSSelector<S, any, any, any>>): string|null;
	toString(ignore: WeakSet<CSSSelector<S, any, any, any>> = new WeakSet()): string|null {
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
		const ands = this._andGroup.map(a => a.toString()).join('');
		
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
}

class CSS<S extends SelectorMap> extends AllCSSMap<S> { }

let cssInstance: CSS<any>|null = null;
export function css<C>(_c?: C) {
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