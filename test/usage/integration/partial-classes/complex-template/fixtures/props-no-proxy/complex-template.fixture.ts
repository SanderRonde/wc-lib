import { ComplexTemplatingWebComponent } from '../../../../../../../build/es/classes/partial.js';
import { config, Props, PROP_TYPE, ComplexType } from '../../../../../../../build/es/wc-lib.js';
import { DeepObject } from '../../../../properties/props/elements/props-element.js';

@config({
	is: 'reflect-props',
	html: null
})
export class ReflectProps extends ComplexTemplatingWebComponent {
	props = Props.define(this, {
		reflect: {
			bool: {
				type: PROP_TYPE.BOOL,
				value: true
			},
			string: {
				type: PROP_TYPE.STRING,
				value: 'test'
			},
			number: {
				type: PROP_TYPE.NUMBER,
				value: 1
			}
		}
	});
}

@config({
	is: 'watched-component',
	html: null
})
export class WatchedComponent extends ComplexTemplatingWebComponent {
	props = Props.define(this, {
		reflect: {
			watched: {
				type: ComplexType<DeepObject>(),
				watchProperties: ['**'],
				value: {
					a: {
						a: 'b',
						c: 'd'
					},
					b: {
						a: 'b',
						c: 'd'
					},
					c: {
						d: {
							a: 'b',
							c: 'd'
						}
					}
				}
			}
		}
	})
}

ReflectProps.define(true);
WatchedComponent.define(true);