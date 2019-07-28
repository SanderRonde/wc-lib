import { IDMapFn, SelectorMap } from './component.js';

type InferSelectors<C> = C extends {
	$: IDMapFn<infer IDS>
} ? IDS : {
	IDS: {};
	CLASSES: {};
	TAGS: {};
	TOGGLES: {};
};

type DefaultObj<S> = S extends undefined ? {} : S;
type DefaultTogglesObj<S> = S extends undefined ? {
	IDS: {};
	CLASSES: {};
	TAGS: {};
} : S;

abstract class AllCSSMap<S extends SelectorMap> {
	constructor(private _onValue?: (sel: CSSSelector<S, any, any, any>) => CSSSelector<S, any, any, any>) { }
	
	_genProxy<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES'>, M extends {
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

function genProxy<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES'>, M extends {
	[key: string]: any;
}>(prefix: string, preRet?: (sel: CSSSelector<S, T, M, any>) => CSSSelector<S, T, any, any>): {
		[K in keyof M]: CSSSelector<S, T, M, K>;
	} {
	return new Proxy({}, {
		get(_, selector) {
			if (typeof selector !== 'string') {
				return '?';
			}
			const cls = new CSSSelector<S, T, M, any>(selector, prefix);
			return preRet ? preRet(cls) : cls;
		}
	}) as {
			[K in keyof M]: CSSSelector<S, T, M, K>;
		};
}

class OrClass<S extends SelectorMap> extends AllCSSMap<S> {
	constructor(onValue: (sel: CSSSelector<S, any, any, any>) => CSSSelector<S, any, any, any>) {
		super(onValue);
	}
}

type ToggleFn<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES'>, ST extends SelectorMap[T], N extends keyof ST> = {
	// @ts-ignore
	(...toggles: DefaultTogglesObj<S['TOGGLES']>[T][N][]): CSSSelector<S, T, ST, N>;
} & {
	// @ts-ignore
	[K in DefaultTogglesObj<S['TOGGLES']>[T][N]]: CSSSelector<S, T, ST, N>;
}

class CSSSelector<S extends SelectorMap, T extends Exclude<keyof SelectorMap, 'TOGGLES'>, ST extends SelectorMap[T], N extends keyof ST> {
	private _andGroup: CSSSelector<S, any, any, any>[] = [];
	private _orParent: CSSSelector<S, any, any, any>|null = null;
	private _orGroup: CSSSelector<S, any, any, any>[] = [];
	private _toggles: string[] = [];

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

	private _registerOr(selector: CSSSelector<S, any, any, any>) {
		let orParent: CSSSelector<S, any, any, any> = this;
		while (orParent._orParent) {
			orParent = orParent._orParent;
		}
		orParent._orGroup.push(
			selector, 
			...selector._orGroup,
			...selector._orParent ? 
				[...selector._orParent._orGroup, selector._orParent] : []
			);
		orParent._orGroup = orParent._orGroup
			.filter((v, i, a) => a.indexOf(v) === i);
		selector._orParent = this;
	}
	
	or = new OrClass<S>((sel) => {
		this._registerOr(sel);
		return sel;
	});
	orFn<T extends Exclude<keyof SelectorMap, 'TOGGLES'>, ST extends SelectorMap[T], N extends keyof ST>(
		sel: CSSSelector<S, T, ST, N>): CSSSelector<S, T, ST, N> {
			this._registerOr(sel);
			return sel;
		}

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
	toggleFn(...toggles: DefaultTogglesObj<S['TOGGLES']>[T][N][]): CSSSelector<S, T, ST, N> {
		this._toggles.push(...toggles as unknown as string);
		return this;
	};

	toString(): string;
	toString(ignore: WeakSet<CSSSelector<S, any, any, any>>): string|null;
	toString(ignore: WeakSet<CSSSelector<S, any, any, any>> = new WeakSet()): string|null {
		if (ignore.has(this)) return null;
		ignore.add(this);

		// Generate the own selector first
		const ownSelector = `${this._prefix}${this._selector}`;
		// Then add any toggles
		const toggles = this._toggles.map(t => `.${t}`).join('');
		// Then any ands
		const ands = this._andGroup.map(a => a.toString()).join('');
		
		const andGroupSelector = `${ownSelector}${toggles}${ands}`;

		return [
			this._orParent ? this._orParent.toString(ignore) : null,
			andGroupSelector,
			...this._orGroup.map(o => o.toString(ignore))
		].filter(i => i !== null).join(', ');
	}
}

class CSS<S extends SelectorMap> extends AllCSSMap<S> { }

let cssInstance = new CSS<any>();
export function css<C>(_c?: C) {
	return cssInstance as CSS<InferSelectors<C>>;;
}