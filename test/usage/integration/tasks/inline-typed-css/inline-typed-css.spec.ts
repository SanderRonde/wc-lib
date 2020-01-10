import { inlineTypedCSS, inlineTypedCSSPipe } from '../../../../../build/es/tasks/inline-typed-css.js';
import * as stream from 'stream';


context('Typed CSS Task', () => {
	const exampleTypedCSS = 'html`<style>${css().$.a.and.b}</style>`';
	context('#inlineTypedCSSPipe', () => {
		it('replaces CSS when file is a buffer', (done) => {
			const file = new stream.Readable();
			file._read = () => {};
			file.push(exampleTypedCSS);
			file.push(null);

			const newStream = file.pipe(inlineTypedCSSPipe());

			let result: string = '';
			newStream.on('data', (data: Buffer|string) => {
				result += data.toString();
			});
			newStream.on('end', () => {
				expect(result).to.be.equal(
					'html`<style>#a.b</style>`');
				done();
			});
		});
	});
	context('#inlineTypedCSS', () => {
		const genStr = (string: string) => {
			return genExpected(`\$\{${string}\}`);
		};
		const genExpected = (value: string) => {
			return `html\`<style>${value} { color: red; } </style>\``;
		}
		it('replaces a single property access', () => {
			const str = `css().$.a`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#a'));
		});
		it('ignores lines with // typed-css-ignore above them', () => {
			const str = `// typed-css-ignore\n${genStr('css().$.a')}`;
			expect(inlineTypedCSS(str))
				.to.be.equal(str);
		});
		it('ignores line-ignored brackets', () => {
			const str = `// {\n${genStr('css().$.a')}`;
			const expected = `// {\n${genExpected('#a')}`;
			expect(inlineTypedCSS(str))
				.to.be.equal(expected);
		});
		it('ignores multiline-ignored brackets', () => {
			const str = `/* { \n { */${genStr('css().$.a')}`;
			const expected = `/* { \n { */${genExpected('#a')}`;
			expect(inlineTypedCSS(str))
				.to.be.equal(expected);
		});
		it('ignores complex expressions as keys', () => {
			const str = `/* { \n { */${genStr('css().$[{}.x]')}`;
			expect(inlineTypedCSS(str))
				.to.be.equal(str);
		});
		it('ignores complex expressions as arguments', () => {
			const str = `/* { \n { */${genStr('css().$.a.attrFn({}.x)')}`;
			expect(inlineTypedCSS(str))
				.to.be.equal(str);
		});
		it('replaces multiple different typed CSS strings', () => {
			const str1 = `css().$.a`;
			const str2 = `css().$.b`;
			const template = `html\`<style>\$\{${str1}\} ` + 
				`{ color: red; } \$\{${str2}\} { color: blue; } </style>\``;
			const expected = `html\`<style>#a ` + 
			`{ color: red; } #b { color: blue; } </style>\``;
			expect(inlineTypedCSS(template))
				.to.be.equal(expected);
		});
		it('replaces chained accesses', () => {
			{
				const str = `css().$.a.and.b`;
				expect(inlineTypedCSS(genStr(str)))
					.to.be.equal(genExpected('#a.b'));
			}

			{
				const str = `css().$.a.or.class.b`;
				expect(inlineTypedCSS(genStr(str)))
					.to.be.equal(genExpected('#a, .b'));
			}

			{
				const str = `css().$.a.and.b.and.c.and.d.and.e`;
				expect(inlineTypedCSS(genStr(str)))
					.to.be.equal(genExpected('#a.b.c.d.e'));
			}
		});
		it('replaces multiline strings', () => {
			const str = `css().$\n.a\n.and\n.b`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#a.b'));
		});
		it('replaces strings with function calls', () => {
			const str = `css().$.a.toggleFn('some-toggle')`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#a.some-toggle'));
		});
		it('replaces partial content of blocks', () => {
			const str = `css().$.a`;
			expect(inlineTypedCSS(genStr(`${str} + ' some-other-text'`)))
				.to.be.equal(genStr(`'#a' + ' some-other-text'`));
		});
		it('class value can be passed', () => {
			const str = `css(SomeClassValue).$.a`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#a'));
		});
		it('handles string literals in arguments', () => {
			const str = `css().$.a.attrFn('c', 'd')`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#a[c="d"]'));
		});
		it('handles numeric literals in arguments', () => {
			const str = `css().$.a.attrFn('c', 1)`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#a[c="1"]'));
		});
		it('handles simple string addition in arguments', () => {
			const str = `css().$.a.attrFn('c', 'd'+'e')`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#a[c="de"]'));
		});
		it('handles simple number addition in arguments', () => {
			const str = `css().$.a.attrFn('c', 1 + 2)`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#a[c="3"]'));
		});
		it('handles string literals in element access', () => {
			const str = `css().$['c']`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#c'));
		});
		it('handles simple string addition in element access', () => {
			const str = `css().$['a'+'b']`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#ab'));
		});
		it('ignores binary expressions if one expression is not simple', () => {
			{
				const str = `css().$.a.attrFn('c', 'a' + {}.x)`;
				const input = genStr(str);
				expect(inlineTypedCSS(input))
					.to.be.equal(input);
			}
			{
				const str = `css().$.a.attrFn('c', {}.x + 'a')`;
				const input = genStr(str);
				expect(inlineTypedCSS(input))
					.to.be.equal(input);
			}
		});
		it('does not replace when property is not a function', () => {
			const str = `css().$()`;
			const input = genStr(str);
			expect(inlineTypedCSS(input))
				.to.be.equal(input);
		});
		it('does not replace when property does not exist', () => {
			{
				const str = `css().x.y`;
				const input = genStr(str);
				expect(inlineTypedCSS(input))
					.to.be.equal(input);
			}
			{
				const str = `css()['x']['y']`;
				const input = genStr(str);
				expect(inlineTypedCSS(input))
					.to.be.equal(input);
			}
		});
		it('can handle expressions as function arguments', () => {
			const str = `css().$.a.orFn(css().$.b)`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#a, #b'));
		});
		it('ignores lines with ignore-comment above them in function declaration', () => {
			{
				const str = `() => { \n// typed-css-ignore\nvar x = css().$.a\n }`;
				expect(inlineTypedCSS(str))
					.to.be.equal(str);
			}
			{
				const str = `function y() { \n// typed-css-ignore\nvar x = css().$.a\n }`;
				expect(inlineTypedCSS(str))
					.to.be.equal(str);
			}
		});
		it('ignores lines with ignore-comment above them in class declaration', () => {
			const str = `class A { \n// typed-css-ignore\nx = css().$.a\n }`;
			expect(inlineTypedCSS(str))
				.to.be.equal(str);
		});
		it('ignores lines with ignore-comment above them in root block', () => {
			const str = `// typed-css-ignore\nvar x = css().$.a`;
			expect(inlineTypedCSS(str))
				.to.be.equal(str);
		});
		it('ignores lines with ignore-comment above them in scope block', () => {
			const str = `{ \n// typed-css-ignore\nvar x = css().$.a\n }`;
			expect(inlineTypedCSS(str))
				.to.be.equal(str);
		});
		it('ignores lines with ignore-comment above them in loop', () => {
			const str = `for (const a of b) { \n// typed-css-ignore\nvar x = css().$.a\n }`;
			expect(inlineTypedCSS(str))
				.to.be.equal(str);
		});
		it('ignores lines with ignore-comment above them in if statement', () => {
			const str = `if ('a' === 'b') { \n// typed-css-ignore\nvar x = css().$.a\n }`;
			expect(inlineTypedCSS(str))
				.to.be.equal(str);
		});
		it('does not re-use comments', () => {
			const str = `// typed-css-ignore\nvar x = css().$.a\nvar x = css().$.a`;
			expect(inlineTypedCSS(str))
				.to.be.equal('// typed-css-ignore\nvar x = css().$.a\nvar x =\'#a\'');
		});
	});
});