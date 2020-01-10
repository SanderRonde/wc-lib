import { inlineI18N, inlineI18NPipe } from '../../../../../build/es/tasks/inline-i18n.js';
import * as stream from 'stream';


const langFile = {
	en: {
		a: 'ae',
		b: 'be',
		c: 'ce',
		d: 'de'
	},
	de: {
		a: 'ad',
		b: 'bd',
		c: 'bd',
		d: 'dd'
	}
}

context('Inline I18N Task', () => {
	const exampleI18N = "html`<div>${this.__('a')}</div>`";
	const defaultReplaceArgs = [
		(lang: {[key: string]: string}, key: string, values: any[]) => {
			return [lang[key as keyof typeof lang], ...values || []].join('-');
		}, 
		langFile, 
		'en'
	] as [(langFile: any, key: string, values: any[]) => string, {
		[key: string]: any;
	}, string];
	context('#inlineI18NPipe', () => {
		it('replaces I18N when file is a string', (done) => {
			const file = new stream.Readable();
			file._read = () => {};
			file.push(exampleI18N);
			file.push(null);

			const newStream = file.pipe(inlineI18NPipe(...defaultReplaceArgs));

			let result: string = '';
			newStream.on('data', (data: Buffer|string) => {
				result += data.toString();
			});
			newStream.on('end', () => {
				expect(result).to.be.equal(
					'html`<div>ae</div>`');
				done();
			});
		});
	});
	context('#inlineI18N', () => {
		const genStr = (string: string) => {
			return genExpected(`\$\{${string}\}`);
		};
		const genExpected = (value: string) => {
			return `html\`<div>${value}</div>\``;
		}
		it('does not replace when a number is passed as the first arg', () => {
			const str = genStr('this.__(10)');
			expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
		});
		it('does not replace when //inline-i18n-ignore is on the previous line', () => {
			const str = '//inline-i18n-ignore\nthis.__("a")';
			expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
		});
		it('does not re-use ignores', () => {
			const str = '//inline-i18n-ignore\nthis.__("a");\nthis.__("b")';
			expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(
				'//inline-i18n-ignore\nthis.__("a");\'be\'');
		});
		it('ignores lines with ignore-comment above them in function declaration', () => {
			{
				const str = '() => {\n//inline-i18n-ignore\nx = this.__("a") }';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
			}
			{
				const str = 'function y() {\n//inline-i18n-ignore\nx = this.__("a") }';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
			}
		});
		it('ignores lines with ignore-comment above them in class declaration', () => {
			const str = 'class A {\n//inline-i18n-ignore\nx = this.__("a") }';
			expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
		});
		it('ignores lines with ignore-comment above them in root block', () => {
			const str = '//inline-i18n-ignore\nvar x = this.__("a")';
			expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
		});
		it('ignores lines with ignore-comment above them in scope block', () => {
			const str = '{\n//inline-i18n-ignore\nvar x = this.__("a") }';
			expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
		});
		it('ignores lines with ignore-comment above them in loop', () => {
			const str = 'for (const a of b) {\n//inline-i18n-ignore\nx = this.__("a") }';
			expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
		});
		it('ignores lines with ignore-comment above them in if statement', () => {
			const str = 'if ("a" === "b") {\n//inline-i18n-ignore\nx = this.__("a") }';
			expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
		});
		it('doesn\'t replace every function call', () => {
			const str = '(() => {})();var x = 3;this.__("a")';
			expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal("(() => {})();var x = 3;'ae'");
		});
		it('doesn\'t replace when base is not \'this\'', () => {
			{
				const str = 'x.__("a")';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
			}
			{
				const str = 'x["__"]("a")';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
			}
		});
		it('replaces single string access when using this.__', () => {
			{
				const str = 'this.__("a")';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal("'ae'");
			}
			{
				const str = 'this.__("a")';
				expect(inlineI18N(genStr(str), 
					...defaultReplaceArgs)).to.be.equal(genExpected('ae'));
			}
			{
				const str = "html`<div>${this.__('a')}</div><div>${'x'}</div>`";
				expect(inlineI18N(str, 
					...defaultReplaceArgs)).to.be.equal(
						"html`<div>ae</div><div>${'x'}</div>`");
			}
		});
		it('replaces single string access when using this[\'__\']', () => {
			{
				const str = 'this["__"]("a")';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal("'ae'");
			}
			{
				const str = 'this["__"]("a")';
				expect(inlineI18N(genStr(str), 
					...defaultReplaceArgs)).to.be.equal(genExpected('ae'));
			}
		});
		it('replaces value when arguments are passed', () => {
			const str = 'this.__("a", "b", "c")';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal("'ae-b-c'");
		});
		it('takes numbers as values', () => {
			const str = 'this.__("a", 1, "c")';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal("'ae-1-c'");
		});
		it('takes simple joined strings as values', () => {
			const str = 'this.__("a", "b" + "d", "c")';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal("'ae-bd-c'");
		});
		it('takes simple joined numbers as values', () => {
			const str = 'this.__("a", 1 + 5, "c")';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal("'ae-6-c'");
		});
		it('takes simple joined strings and numbers as values', () => {
			const str = 'this.__("a", 1 + "0", "c")';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal("'ae-10-c'");
		});
		it('ignores complex arguments', () => {
			const str = 'this.__("a", {})';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
		});
		it('takes another instance of the i18n function call', () => {
			const str = 'this.__("a", this.__("b"))';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal("'ae-be'");
		});
		it('ignores invalid nested instances', () => {
			const str = 'this.__("a", this.__("b", {}))';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal(str);
		});
		it('ignores if the getMessage function errors ', () => {
			const str = 'this.__("a")';
			expect(inlineI18N(str, () => {
				throw new Error('err');
			}, defaultReplaceArgs[1], defaultReplaceArgs[2])).to.be.equal(str);
		});
		it('replaces current language only if language is passed', () => {
			const str = 'this.__("a")';
				expect(inlineI18N(str, ...defaultReplaceArgs)).to.be.equal("'ae'");
		});
		it('replaces all languages if no language is passed', () => {
			const str = 'this.__("a")';
			const result = inlineI18N(str, defaultReplaceArgs[0],
				defaultReplaceArgs[1]);
			for (const lang in langFile) {
				expect(result).to.have.property(lang);
				const langResult = result[lang as keyof typeof lang];
				expect(langResult).to.be.equal(`'${defaultReplaceArgs[0](
					langFile[lang as keyof typeof langFile], 'a', [])}'`)
			}
		});
	});
});