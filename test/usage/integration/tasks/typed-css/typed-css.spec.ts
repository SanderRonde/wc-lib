import { inlineTypedCSS, inlineTypedCSSPipe } from '../../../../../src/tasks/typed-css.js';

class FakeBuffer {
	constructor(private _data: string) { }

	static from(data: string) {
		return new FakeBuffer(data);
	}

	toString() {
		return this._data;
	}
}

const buf = Buffer || FakeBuffer;

context('Typed CSS Task', () => {
	const exampleTypedCSS = 'html`<style>${css().$.a.and.b}</style>`';
	context('#inlineTypedCSSPipe', () => {
		it('ignores null files', () => {
			const file = {
				isNull() { return true; },
				isStream() { return false },
				contents: buf.from(exampleTypedCSS)
			};
			const newFile = inlineTypedCSSPipe()(file);
			expect(newFile).to.have.property('contents');
			expect(newFile.contents.toString()).to.be.equal(exampleTypedCSS);
		});
		it('throws an error when the file is a stream', () => {
			const file = {
				isNull() { return false; },
				isStream() { return true },
				contents: buf.from(exampleTypedCSS)
			};
			expect(() => {
				inlineTypedCSSPipe()(file);
			}).to.throw('Streaming not supported');
		});
		it('replaces CSS when file is a string', () => {
			const file = {
				isNull() { return false; },
				isStream() { return false },
				contents: buf.from(exampleTypedCSS)
			};
			const newFile = inlineTypedCSSPipe()(file);
			expect(newFile).to.have.property('contents');
			expect(newFile.contents.toString()).to.be.equal(
				'html`<style>#a.b</style>`');
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
		it('executes the entire block', () => {
			const str = `css().$.a`;
			expect(inlineTypedCSS(genStr(`${str} + ' some-other-text'`)))
				.to.be.equal(genExpected('#a' + ' some-other-text'));
		});
		it('class value can be passed', () => {
			const str = `css(SomeClassValue).$.a`;
			expect(inlineTypedCSS(genStr(str)))
				.to.be.equal(genExpected('#a'));
		});
	});
});