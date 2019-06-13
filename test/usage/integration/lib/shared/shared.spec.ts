import { wait, classNames, WCLibError } from "../../../../../src/wclib";
import { SLOW } from "../../../lib/timing";

function genString() {
	const letters = [
		...'abcdefghijklmnopqrstuvwxyz'.split(''),
		...'abcdefghijklmnopqrstuvwxyz'.split('').map(c => c.toUpperCase()),
		...'1234567890'.split('')
	]

	const length = 10 + (Math.random() * 50);
	let str: string[] = [];
	for (let i = 0; i < length; i++) {
		str.push(letters[Math.floor(Math.random() * letters.length)]);
	}
	return str.join('');
}

function flatten(arr: any[]): any[] {
	const elements = [];
	for (const element of arr) {
		if (Array.isArray(element)) {
			elements.push(...flatten(element));
		} else {
			elements.push(element);
		}
	}
	return elements;
}

context('Shared', function() {
	this.slow(SLOW);

	context('#wait', () => {
		it('waits 0ms when passing 0 for the time', () => {
			const done = cy.spy();
			wait(0).then(done as any);
			cy.wait(0)
				.then(() => {
					expect(done).to.be.calledOnce;
				});
		});
		it('waits x ms when passing x for the time', () => {
			const done = cy.spy();
			const waitTime = 100 + (Math.random() * 1000);
			wait(waitTime).then(done as any);
			cy.wait(waitTime)
				.then(() => {
					expect(done).to.be.calledOnce;
				});
		});
	});
	context('#classNames', () => {
		it('returns empty string when passed no args', () => {
			expect(classNames()).to.be.equal('');
		});
		it('joins strings when passed strings', () => {
			const strings = [
				genString(),
				genString(),
				genString(),
				genString(),
				genString()
			]
			expect(classNames(...strings)).to.be.equal(strings.join(' '));
		});
		it('ignores invalid types (has to be either string, number, array or object)', () => {
			expect(classNames('a', Symbol('x') as any), 'b').to.be.equal('a b');
			expect(classNames('a', (() => {}) as any), 'b').to.be.equal('a b');
		});
		it('joins numbers when passed just numbers', () => {
			const nums = [
				Math.floor(Math.random() * 500),
				Math.floor(Math.random() * 500),
				Math.floor(Math.random() * 500),
				Math.floor(Math.random() * 500),
				Math.floor(Math.random() * 500)
			]
			expect(classNames(...nums)).to.be.equal(
				nums.map(n => n + '').join(' '));
		});
		it('joins strings and numbers when passed both', () => {
			const nums = [
				genString(),
				Math.floor(Math.random() * 500),
				genString(),
				Math.floor(Math.random() * 500),
				genString(),
				Math.floor(Math.random() * 500),
				genString(),
				Math.floor(Math.random() * 500),
				genString(),
				Math.floor(Math.random() * 500)
			]
			expect(classNames(...nums)).to.be.equal(
				nums.map(n => n + '').join(' '));
		});
		it('ignores falsy values', () => {
			const nums = [
				genString(),
				false,
				Math.floor(Math.random() * 500),
				false,
				genString(),
				Math.floor(Math.random() * 500),
				false,
				genString(),
				Math.floor(Math.random() * 500),
				false,
				genString(),
				Math.floor(Math.random() * 500),
				false,
				genString(),
				Math.floor(Math.random() * 500),
				false
			]
			expect(classNames(...nums as any)).to.be.equal(
				nums.filter(v => !!v).map(n => n + '').join(' '));
		});
		it('joins passed arrays', () => {
			const strings = [
				genString(),
				genString(),
				genString(),
				genString(),
				genString()
			];
			const stringArray = [
				genString(),
				strings,
				genString(),
				genString(),
				strings,
				genString(),
				genString()
			]
			expect(classNames(...stringArray)).to.be.equal(
				flatten(stringArray).join(' '));
		});
		it('ignores falsy array elements', () => {
			const strings = [
				genString(),
				false,
				genString(),
				false,
				genString()
			];
			const stringArray = [
				genString(),
				strings,
				genString(),
				genString(),
				strings,
				genString(),
				genString()
			]
			expect(classNames(...stringArray)).to.be.equal(
				flatten(stringArray).filter(el => !!el).join(' '));
		});
		it('joins nested arrays', () => {
			const strings = [
				genString(),
				genString(),
				genString(),
				genString(),
				genString()
			];
			const stringArray = [
				genString(),
				strings,
				genString(),
				genString(),
				strings,
				genString(),
				genString()
			];
			const nestedArray = [
				genString(),
				stringArray,
				genString(),
				stringArray,
				genString(),
				stringArray,
				genString()
			]
			expect(classNames(...nestedArray)).to.be.equal(
				flatten(nestedArray).join(' '));
		});
		it('joins truthy object values', () => {
			const obj = {
				a: Math.random() > 0.5,
				b: Math.random() > 0.5,
				c: Math.random() > 0.5,
				d: Math.random() > 0.5,
				e: Math.random() > 0.5,
				f: Math.random() > 0.5,
				g: Math.random() > 0.5
			};

			expect(classNames(obj)).to.be.equal(
				Object.getOwnPropertyNames(obj)
					.filter(k => !!obj[k as keyof typeof obj]).join(' '));
		});
	});
	context('WCLibError', () => {
		it('can create an error', () => {
			const component = {};
			const msg = genString();
			const err = new WCLibError(component as any, msg);
			expect(() => {
				throw err;
			}).to.throw(msg);

			try {
				throw err;
			} catch(e) {
				expect(e).to.have.property('component')
					.to.be.equal(component);
				expect(e).to.have.property('message')
					.to.be.equal(`${msg} (see error.component)`);
			}
		});
	});
});