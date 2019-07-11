import { config, Props, PROP_TYPE, ComplexType } from '../../../../../../../src/wclib.js';
import { DeepObject } from '../../../../properties/props/elements/props-element.js';
import { BasicWebComponent } from '../../../../../../../src/classes/partial.js';

@config({
	is: 'reflect-props',
	html: null
})
export class ReflectProps extends BasicWebComponent {
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
export class WatchedComponent extends BasicWebComponent {
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

ReflectProps.define();
WatchedComponent.define();