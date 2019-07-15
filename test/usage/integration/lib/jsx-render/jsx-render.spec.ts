import { SLOW } from "../../../lib/timing.js";

export function jsxRenderSpec(fixture: string) {
	context('JSX-Render', function() {
		this.slow(SLOW);
		before(() => {
			cy.visit(fixture);
		});

		context('Basic rendering', () => {
			context('to DOM', () => {
				it('renders a simple element to DOM', () => {
					//TODO:
				});
				it('renders nested elements to DOM', () => {
					//TODO:
				});
				it('renders unknown tagnames to DOM', () => {
					//TODO:
				});
				it('renders passed class components to DOM', () => {
					//TODO:
				});
				it('sets attributes/props', () => {
					//TODO:
				});
				context('Updates', () => {
					it('freshly re-renders child if content is different', () => {
						//TODO:
					});
					it('freshly re-renders child if it changes from text to an element', () => {
						//TODO:
					});
					it('freshly re-renders child if it changes from an element to text', () => {
						//TODO:
					});
					it('freshly re-renders child if tag is different', () => {
						//TODO:
					});
					it('removes removed attributes', () => {
						//TODO:
					});
					it('adds new attributes', () => {
						//TODO:
					});
					it('keeps unchanged attributes', () => {
						//TODO:
					});
					it('removes children that are no longer there', () => {
						//TODO:
					});
					it('renders added children', () => {
						//TODO:
					});
				});
			});
			context('to text', () => {
				it('renders a simple element to text', () => {
					//TODO:
				});
				it('rsender nested elements to text', () => {
					//TODO:
				});
				it('renders unknown tagnames to text', () => {
					//TODO:
				});
				it('renders passed class components to text', () => {
					//TODO:
				});
				it('updates rendered text when props are changed', () => {
					//TODO:
				});
			});
		});
		context('Special props', () => {
			context('Automatic detection', () => {
				it('handles non-special props regularly', () => {
					//TODO:
				});
				it('sets boolean props only if true (PROP_TYPE.BOOL)', () => {
					//TODO:
				});
				it('sets boolean props only if true ({type: PROP_TYPE.BOOL})', () => {
					//TODO:
				});
				it('generates ref to complex value (ComplexType<...>())', () => {
					//TODO:
				});
				it('generates ref to complex value ({type: ComplexType<...>()})', () => {
					//TODO:
				});
			});
			context('Group-based', () => {
				it('adds event listeners in the __listeners group', () => {
					//TODO:
				});
				it('calls event listeners in the __listeners group when fired', () => {
					//TODO:
				});
				it('adds custom event listeners in the ___listeners group', () => {
					//TODO:
				});
				it('calls custom event listeners in the ___listeners group when fired', () => {
					//TODO:
				});
			});
			context('Name-based', () => {
				it('adds listener to attributes prefixed by @', () => {
					//TODO:
				});
				it('adds custom listener to attributes prefixed by @@', () => {
					//TODO:
				});
				it('only sets attributes if true when prefixed by ?', () => {
					//TODO:
				});
				it('correctly calculates class string based on object when attr name is "class"', () => {
					//TODO:
				});
				it('generates ref for attributes starting with #', () => {
					//TODO:
				});
				it('generates ref for attributes with name custom-css', () => {
					//TODO:
				});
			});
		});
	});
}