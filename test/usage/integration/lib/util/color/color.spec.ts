import { Color } from "../../../../../../src/wclib";
import { SLOW } from "../../../../lib/timing";

function genNum() {
	return Math.floor(Math.random() * 255);
}

function genAlphaNum() {
	return Math.floor(Math.random() * 100);
}

function genColor() {
	const r = genNum();
	const g = genNum();
	const b = genNum();
	return { r, g, b };
}

function singleNumToHex(num: number) {
	if (num < 10) {
		return num + '';
	}
	return String.fromCharCode(97 + num - 10);
}

function toHex(num: number) {
	const major = Math.floor(num / 16);
	const minor = num % 16;
	return `${singleNumToHex(major)}${singleNumToHex(minor)}`;
}

function colorToHex({ r, g, b }: { 
	r: number;
	g: number;
	b: number;
}) {
	return {
		rh: toHex(r),
		gh: toHex(g),
		bh: toHex(b)
	}
}

function alphaNumToStr(a: number) {
	if (typeof a === 'number') {
		if (a === 100) {
			return '1';
		} else if (a < 10) {
			return `0.0${a}`;
		} else {
			return `0.${a}`;
		}
	}
	return '1';
}

context('Color', function() {
	this.slow(SLOW);

	context('#getColorRepresentation', () => {
		it('can get a non-RGBA hex color representation', () => {
			const { r, g, b } = genColor();
			const { rh, gh, bh } = colorToHex({r, g, b});
			const color = Color.getColorRepresentation(`#${rh}${gh}${bh}`);
			expect(color).to.have.property('r')
				.to.be.equal(r);
			expect(color).to.have.property('g')
				.to.be.equal(g);
			expect(color).to.have.property('b')
				.to.be.equal(b);
			expect(color).to.have.property('a')
				.to.be.equal(100);
		});
		it('can get an RGBA hex color representation', () => {
			const { r, g, b } = genColor();
			const { rh, gh, bh } = colorToHex({r, g, b});
			const a = genAlphaNum();
			const ah = toHex(Math.floor(a * 2.56));
			const color = Color.getColorRepresentation(`#${ah}${rh}${gh}${bh}`);
			expect(color).to.have.property('r')
				.to.be.equal(r);
			expect(color).to.have.property('g')
				.to.be.equal(g);
			expect(color).to.have.property('b')
				.to.be.equal(b);
			expect(color).to.have.property('a')
				.to.be.closeTo(a, 0.5);
		});
		it('can get an rgba(r, g, b, a) color representation', () => {
			const { r, g, b } = genColor();
			const a = Math.max(genAlphaNum() - 1, 0);
			const color = Color.getColorRepresentation(`rgba(${r}, ${g}, ${b}, 0.${a})`);
			expect(color).to.have.property('r')
				.to.be.equal(r);
			expect(color).to.have.property('g')
				.to.be.equal(g);
			expect(color).to.have.property('b')
				.to.be.equal(b);
			expect(color).to.have.property('a')
				.to.be.equal(a);
		});
		it('ignores spacing in rgba(r, g, b, a) colors', () => {
			const { r, g, b } = genColor();
			const a = genAlphaNum();
			const color = Color.getColorRepresentation(`rgba( ${r} ,  ${g} ,  ${b} ,  0.${a} )`);
			expect(color).to.have.property('r')
				.to.be.equal(r);
			expect(color).to.have.property('g')
				.to.be.equal(g);
			expect(color).to.have.property('b')
				.to.be.equal(b);
			expect(color).to.have.property('a')
				.to.be.equal(a);
		});
		it('can get an rgb(r, g, b) color representation', () => {
			const { r, g, b } = genColor();
			const color = Color.getColorRepresentation(`rgb(${r}, ${g}, ${b})`);
			expect(color).to.have.property('r')
				.to.be.equal(r);
			expect(color).to.have.property('g')
				.to.be.equal(g);
			expect(color).to.have.property('b')
				.to.be.equal(b);
		});
		it('ignores spacing in rgb(r, g, b) colors', () => {
			const { r, g, b } = genColor();
			const color = Color.getColorRepresentation(`rgb( ${r} ,  ${g} ,  ${b} )`);
			expect(color).to.have.property('r')
				.to.be.equal(r);
			expect(color).to.have.property('g')
				.to.be.equal(g);
			expect(color).to.have.property('b')
				.to.be.equal(b);
		});
		it('returns a mapped color if it\'s in the color map', () => {
			const color = Color.getColorRepresentation('red');
			expect(color).to.have.property('r')
				.to.be.equal(255);
			expect(color).to.have.property('g')
				.to.be.equal(0);
			expect(color).to.have.property('b')
				.to.be.equal(0);
		});
		it('returns black if an invalid color that starts with # is passed', () => {
			const color = Color.getColorRepresentation('#invalidcolor');
			expect(color).to.have.property('r')
				.to.be.equal(0);
			expect(color).to.have.property('g')
				.to.be.equal(0);
			expect(color).to.have.property('b')
				.to.be.equal(0);
		});
		it('returns black if an invalid color that starts with rgba is passed', () => {
			const color = Color.getColorRepresentation('rgba(invalidcolor)');
			expect(color).to.have.property('r')
				.to.be.equal(0);
			expect(color).to.have.property('g')
				.to.be.equal(0);
			expect(color).to.have.property('b')
				.to.be.equal(0);
		});
		it('returns black if an invalid color that starts with rgb is passed', () => {
			const color = Color.getColorRepresentation('rgb(invalidcolor)');
			expect(color).to.have.property('r')
				.to.be.equal(0);
			expect(color).to.have.property('g')
				.to.be.equal(0);
			expect(color).to.have.property('b')
				.to.be.equal(0);
		});
		it('returns black if an invalid color was passed', () => {
			const color = Color.getColorRepresentation('invalidcolor');
			expect(color).to.have.property('r')
				.to.be.equal(0);
			expect(color).to.have.property('g')
				.to.be.equal(0);
			expect(color).to.have.property('b')
				.to.be.equal(0);
		});
	});
	context('#toStringColor', () => {
		it('correctly converts an rgb string', () => {
			const { r, g, b } = genColor();
			const color = Color.toStringColor({ r, g, b });
			expect(color).to.be.equal(`rgba(${r}, ${g}, ${b}, 1)`);
		});
		it('correctly converts an rgba string with a=0', () => {
			const { r, g, b } = genColor();
			const color = Color.toStringColor({ r, g, b, a: 0 });
			expect(color).to.be.equal(`rgba(${r}, ${g}, ${b}, 0.00)`);
		});
		it('correctly converts an rgba string with a < 10 and a > 0', () => {
			const { r, g, b } = genColor();
			const a = Math.floor(Math.random() * 8) + 1;
			const color = Color.toStringColor({ r, g, b, a });
			expect(color).to.be.equal(`rgba(${r}, ${g}, ${b}, 0.0${a})`);
		});
		it('correctly converts an rgba string with a < 100 and a > 10', () => {
			const { r, g, b } = genColor();
			const a = Math.floor(Math.random() * 89) + 10;
			const color = Color.toStringColor({ r, g, b, a });
			expect(color).to.be.equal(`rgba(${r}, ${g}, ${b}, 0.${a})`);
		});
		it('correctly converts an rgba string with a == 100', () => {
			const { r, g, b } = genColor();
			const a = 100;
			const color = Color.toStringColor({ r, g, b, a });
			expect(color).to.be.equal(`rgba(${r}, ${g}, ${b}, 1)`);
		});
	});
	context('#changeOpacity', () => {
		it('sets alpha to 0 when 0 is passed', () => {
			const { r, g, b } = genColor();
			const color = Color.changeOpacity(`rgb(${r}, ${g}, ${b})`, 0);
			expect(color).to.be.equal(`rgba(${r}, ${g}, ${b}, 0.00)`);
		});
		it('sets alpha to 100 if 100 is passed', () => {
			const { r, g, b } = genColor();
			const color = Color.changeOpacity(`rgb(${r}, ${g}, ${b})`, 100);
			expect(color).to.be.equal(`rgba(${r}, ${g}, ${b}, 1)`);
		});
		it('sets alpha to x if x is passed', () => {
			const { r, g, b } = genColor();
			const a = genAlphaNum();
			const color = Color.changeOpacity(`rgb(${r}, ${g}, ${b})`, a);
			expect(color).to.be.equal(`rgba(${r}, ${g}, ${b}, ${alphaNumToStr(a)})`);
		});
	});
	context('#isDark', () => {
		it('recognizes non-dark colors if alpha is 100', () => {
			const r = Math.floor(Math.random() * 155) + 100;
			const g = Math.floor(Math.random() * 155) + 100;
			const b = Math.floor(Math.random() * 155) + 100;
			expect(Color.isDark(`rgba(${r}, ${g}, ${b}, 1)`)).to.be.false;
		});
		it('recognizes dark colors if alpha is 100', () => {
			const r = Math.floor(Math.random() * 99);
			const g = Math.floor(Math.random() * 99);
			const b = Math.floor(Math.random() * 99);
			expect(Color.isDark(`rgba(${r}, ${g}, ${b}, 1)`)).to.be.true;
		});
		it('always returns true when alpha is lower than (100 / 2.56)', () => {
			const { r, g, b } = genColor();
			const a = Math.floor(Math.random() * (100 / 2.56));
			expect(Color.isDark(`rgba(${r}, ${g}, ${b}, ${(() => {
				if (a === 0) {
					return '0';
				} else if (a < 10) {
					return `0.0${a}`;
				} else if (a < 100) {
					return `0.${a}`;
				} else {
					return '1';
				}
			})()})`)).to.be.true;
		});
	});
	context('#RGBToRGBA', () => {
		it('converts rgb to rgba correctly if alpha is 0', () => {
			const { r, g, b } = genColor();
			const color = Color.RGBToRGBA({ r, g, b }, 0);
			expect(color).to.have.property('r')
				.to.be.equal(r);
			expect(color).to.have.property('g')
				.to.be.equal(g);
			expect(color).to.have.property('b')
				.to.be.equal(b);
			expect(color).to.have.property('a')
				.to.be.equal(0);
		});
		it('converts rgb to rgba correctly if alpha is 100', () => {
			const { r, g, b } = genColor();
			const color = Color.RGBToRGBA({ r, g, b }, 100);
			expect(color).to.have.property('r')
				.to.be.equal(r);
			expect(color).to.have.property('g')
				.to.be.equal(g);
			expect(color).to.have.property('b')
				.to.be.equal(b);
			expect(color).to.have.property('a')
				.to.be.equal(100);
		});
		it('converts rgb to rgba correctly if alpha is x', () => {
			const { r, g, b } = genColor();
			const a = genAlphaNum();
			const color = Color.RGBToRGBA({ r, g, b }, a);
			expect(color).to.have.property('r')
				.to.be.equal(r);
			expect(color).to.have.property('g')
				.to.be.equal(g);
			expect(color).to.have.property('b')
				.to.be.equal(b);
			expect(color).to.have.property('a')
				.to.be.equal(a);
		});
	});
	context('#mergeColors', () => {
		function genHalfColor() {
			const { r, g, b } = genColor();
			return {
				r: Math.floor(r / 2),
				g: Math.floor(g / 2),
				b: Math.floor(b / 2),
			}
		}

		function genHalfAlpha() {
			return Math.floor(genAlphaNum() / 2);
		}

		it('merges two strings correctly', () => {
			const { r: r1, g: g1, b: b1 } = genHalfColor();
			const a1 = genHalfAlpha();
			const color1 = `rgba(${r1}, ${g1}, ${b1}, ${alphaNumToStr(a1)})`

			const { r: r2, g: g2, b: b2 } = genHalfColor();
			const a2 = genHalfAlpha();
			const color2 = `rgba(${r2}, ${g2}, ${b2}, ${alphaNumToStr(a2)})`

			const color = Color.mergeColors(color1, color2);
			expect(color).to.be.equal(
				`rgba(${r1 + r2}, ${g1 + g2}, ${b1 + b2}, ${alphaNumToStr(a1 + a2)})`);
		});
		it('merges two rgb representations correctly', () => {
			const { r: r1, g: g1, b: b1 } = genHalfColor();

			const { r: r2, g: g2, b: b2 } = genHalfColor();

			const color = Color.mergeColors({ r: r1, g: g1, b: b1 }, { r: r2, g: g2, b: b2 });
			expect(color).to.be.equal(
				`rgba(${r1 + r2}, ${g1 + g2}, ${b1 + b2}, ${alphaNumToStr(100)})`);
		});
		it('meges two rgba representations correctly', () => {
			const { r: r1, g: g1, b: b1 } = genHalfColor();
			const a1 = genHalfAlpha();

			const { r: r2, g: g2, b: b2 } = genHalfColor();
			const a2 = genHalfAlpha();

			const color = Color.mergeColors({ r: r1, g: g1, b: b1, a: a1 }, { r: r2, g: g2, b: b2, a: a2 });
			expect(color).to.be.equal(
				`rgba(${r1 + r2}, ${g1 + g2}, ${b1 + b2}, ${alphaNumToStr(a1 + a2)})`);
		});
		it('merges an rgb representation with a string', () => {
			const { r: r1, g: g1, b: b1 } = genHalfColor();

			const { r: r2, g: g2, b: b2 } = genHalfColor();
			const a2 = genHalfAlpha();
			const color2 = `rgba(${r2}, ${g2}, ${b2}, ${alphaNumToStr(a2)})`

			const color = Color.mergeColors({ r: r1, g: g1, b: b1 }, color2);
			expect(color).to.be.equal(
				`rgba(${r1 + r2}, ${g1 + g2}, ${b1 + b2}, ${alphaNumToStr(100)})`);
		});
		it('merges an rgba representation with a string', () => {
			const { r: r1, g: g1, b: b1 } = genHalfColor();
			const a1 = genHalfAlpha();

			const { r: r2, g: g2, b: b2 } = genHalfColor();
			const a2 = genHalfAlpha();
			const color2 = `rgba(${r2}, ${g2}, ${b2}, ${alphaNumToStr(a2)})`

			const color = Color.mergeColors({ r: r1, g: g1, b: b1, a: a1 }, color2);
			expect(color).to.be.equal(
				`rgba(${r1 + r2}, ${g1 + g2}, ${b1 + b2}, ${alphaNumToStr(a1 + a2)})`);
		});
		it('merges an rgb representation with an rgba representation', () => {
			const { r: r1, g: g1, b: b1 } = genHalfColor();
			const a1 = genHalfAlpha();

			const { r: r2, g: g2, b: b2 } = genHalfColor();
			const color2 = { r: r2, g: g2, b: b2 };

			const color = Color.mergeColors({ r: r1, g: g1, b: b1, a: a1 }, color2);
			expect(color).to.be.equal(
				`rgba(${r1 + r2}, ${g1 + g2}, ${b1 + b2}, ${alphaNumToStr(100)})`);
		});
		it('subtracts color2 from color1 when subtract is set to true', () => {
			const { r: r1, g: g1, b: b1 } = genHalfColor();
			const a1 = genHalfAlpha();

			const { r: r2, g: g2, b: b2 } = genHalfColor();
			const a2 = genHalfAlpha();

			const color = Color.mergeColors({ r: r1, g: g1, b: b1, a: a1 }, { r: r2, g: g2, b: b2, a: a2 }, 
				true);
			expect(color).to.be.equal(
				`rgba(${Math.max(r1 - r2, 0)}, ${Math.max(g1 - g2, 0)}, ${
					Math.max(b1 - b2, 0)}, ${alphaNumToStr(Math.max(a1 - a2, 0))})`);
		});
		it('caps the max color value at 255', () => {
			const color = Color.mergeColors(
				{ r: 200, g: 100, b: 250, a: 60}, { r: 200, g: 200, b: 100, a: 100});
			expect(color).to.be.equal(`rgba(255, 255, 255, 1)`);
		});
		it('caps the min color value at 0', () => {
			const color = Color.mergeColors(
				{ r: 200, g: 100, b: 250, a: 60}, { r: 200, g: 200, b: 400, a: 100}, true);
			expect(color).to.be.equal(`rgba(0, 0, 0, 0.00)`);
		});
	});
});