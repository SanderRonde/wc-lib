import { SelectorMap, IDMapFn } from '../../../../../src/lib/component.js';
import { css } from '../../../../../src/lib/css.js';

type InferrableClass<S extends SelectorMap> = {
	$: IDMapFn<S>;
};

type BasicClass = InferrableClass<{
	IDS: {
		a: HTMLElement;
		b: HTMLElement;
	};
	CLASSES: {
		c: HTMLElement;
		d: HTMLElement;
	};
	TAGS: {
		e: HTMLElement;
		f: HTMLElement;
	};
	TOGGLES: {
		IDS: {
			a: 'a-toggle'|'a-toggle-2';
		}
		CLASSES: {
			c: 'c-toggle';
		}
		TAGS: {
			e: 'e-toggle';
		}
	}
}>;

context('Typed CSS', () => {
	context('Basic usage', () => {
		it('#toString works on classes', () => {
			const cls = css<BasicClass>().$.a;
			expect(cls).to.not.be.string;
			expect(cls.toString()).to.be.string;
			expect(cls.toString()).to.be.equal('#a');
		});
		it('String(cls) works on classes', () => {
			const cls = css<BasicClass>().$.a;
			expect(cls).to.not.be.string;
			expect(String(cls)).to.be.string;
			expect(String(cls)).to.be.equal('#a');
		});
	});
	context('Single string', () => {
		it('can generate a single ID string through .$', () => {
			expect(css<BasicClass>().$.a.toString()).to.be.equal('#a');
		});
		it('can generate a single ID string through .i', () => {
			expect(css<BasicClass>().i.a.toString()).to.be.equal('#a');
		});
		it('can generate a single ID string through .id', () => {
			expect(css<BasicClass>().id.a.toString()).to.be.equal('#a');
		});

		it('can generate a single class string through .class', () => {
			expect(css<BasicClass>().class.c.toString()).to.be.equal('.c');
		});
		it('can generate a single class string through .c', () => {
			expect(css<BasicClass>().c.c.toString()).to.be.equal('.c');
		});

		it('can generate a single tag string through .tag', () => {
			expect(css<BasicClass>().tag.e.toString()).to.be.equal('e');
		});
		it('can generate a single tag string through .t', () => {
			expect(css<BasicClass>().t.e.toString()).to.be.equal('e');
		});
	});
	context('Single joining', () => {
		context('And', () => {
			it('can join two class strings', () => {
				const expr = css<BasicClass>().class.c.and.d;
				expect(expr.toString()).to.be.equal('.c.d');
			});
			it('can join a class string with an ID string', () => {
				const expr = css<BasicClass>().id.a.and.d;
				expect(expr.toString()).to.be.equal('#a.d');
			});
			it('can join a class string with a tag string', () => {
				const expr = css<BasicClass>().tag.e.and.d;
				expect(expr.toString()).to.be.equal('e.d');
			});
		});
		context('Or', () => {
			it('can join two ID strings', () => {
				const expr = css<BasicClass>().id.a.or.id.b;
				expect(expr.toString()).to.be.equal('#a, #b');
			});
			it('can join two class strings', () => {
				const expr = css<BasicClass>().class.c.or.class.d;
				expect(expr.toString()).to.be.equal('.c, .d');
			});
			it('can join two tag strings', () => {
				const expr = css<BasicClass>().tag.e.or.tag.f;
				expect(expr.toString()).to.be.equal('e, f');
			});
			it('can join an ID string with another type', () => {
				const expr1 = css<BasicClass>().id.a.or.class.c;
				expect(expr1.toString()).to.be.equal('#a, .c');
				const expr2 = css<BasicClass>().id.a.or.tag.e;
				expect(expr2.toString()).to.be.equal('#a, e');
			});
			it('can join a class string with another type', () => {
				const expr1 = css<BasicClass>().class.c.or.id.a;
				expect(expr1.toString()).to.be.equal('.c, #a');
				const expr2 = css<BasicClass>().class.c.or.tag.e;
				expect(expr2.toString()).to.be.equal('.c, e');
			});
			it('can join a tag string with another type', () => {
				const expr1 = css<BasicClass>().tag.e.or.id.a;
				expect(expr1.toString()).to.be.equal('e, #a');
				const expr2 = css<BasicClass>().tag.e.or.class.c;
				expect(expr2.toString()).to.be.equal('e, .c');
			});
		});
	});
	context('Longer join chains', () => {
		it('can join more than two strings with and', () => {
			type MultiClassStr = InferrableClass<{
				IDS: { a: HTMLElement; }
				CLASSES: {
					b: HTMLElement;
					c: HTMLElement;
					d: HTMLElement;
					e: HTMLElement;
					f: HTMLElement;
					g: HTMLElement;
				}
			}>;
			const expr = css<MultiClassStr>().id.a.and.b.and.c
				.and.d.and.e.and.f.and.g;
			expect(expr.toString()).to.be.equal('#a.b.c.d.e.f.g');
		});
		it('can join more than two strings with or', () => {
			const expr = css<BasicClass>().id.a.or.id.b.or.class.c
				.or.class.d.or.tag.e.or.tag.f;
			expect(expr.toString()).to.be.equal('#a, #b, .c, .d, e, f');
		});
		it('creates groups correctly when using both and and or', () => {
			const expr = css<BasicClass>().id.a.and.c.or.id.b.
				and.c.and.d.or.tag.e.or.tag.f;
			expect(expr.toString()).to.be.equal('#a.c, #b.c.d, e, f');
		});
		it('can join groups when manually passing a new class instance', () => {
			const expr = css<BasicClass>().id.a.and.c.orFn(
				css<BasicClass>().id.b.and.c.and.d);
			expect(expr.toString()).to.be.equal('#a.c, #b.c.d');
		});
		it('can chain on the inner class instance', () => {
			const expr = css<BasicClass>().id.a.and.c.orFn(
				css<BasicClass>().id.b.and.c.and.d.orFn(
					css<BasicClass>().tag.e
				));
			expect(expr.toString()).to.be.equal('#a.c, #b.c.d, e');
		});
		it('can chain on the outer class instance', () => {
			const expr = css<BasicClass>().id.a.and.c.orFn(
				css<BasicClass>().id.b.and.c.and.d).orFn(
					css<BasicClass>().tag.e
				)
			expect(expr.toString()).to.be.equal('#a.c, #b.c.d, e');
		});
	});
	context('Toggleable classes', () => {
		it('adds togglable classes to ID strings', () => {
			const expr = css<BasicClass>().id.a.toggle['a-toggle'];
			expect(expr.toString()).to.be.equal('#a.a-toggle');
		});
		it('adds togglable classes to class strings', () => {
			const expr = css<BasicClass>().class.c.toggle['c-toggle'];
			expect(expr.toString()).to.be.equal('.c.c-toggle');
		});
		it('adds togglable classes to tag strings', () => {
			const expr = css<BasicClass>().tag.e.toggle['e-toggle'];
			expect(expr.toString()).to.be.equal('e.e-toggle');
		});
		it('can add toggleable classes through calling the function', () => {
			const expr = css<BasicClass>().id.a.toggleFn('a-toggle')
			expect(expr.toString()).to.be.equal('#a.a-toggle');
		});
		it('can add multiple toggles', () => {
			const expr = css<BasicClass>().id.a.toggle['a-toggle']
				.toggle["a-toggle-2"];
			expect(expr.toString()).to.be.equal('#a.a-toggle.a-toggle-2');
		});
	});
});