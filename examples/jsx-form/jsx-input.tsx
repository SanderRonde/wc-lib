import { ConfigurableWebComponent, Props, config, PROP_TYPE, CHANGE_TYPE, TemplateFn } from '../../src/wclib';
import { JSXIntrinsicProps } from '../../src/classes/types';
import { render } from 'lit-html';

declare global {
	namespace JSX {
		interface IntrinsicAttributes extends JSXIntrinsicProps { }
		interface IntrinsicElements {
			div: {
				id?: string;
			}
			h2: {};
			input: {
				id?: string;
				value?: string;
				type?: 'text'|'password'|'tel'|'number'
			}
		}
	}
}

@config({
	is: 'jsx-input',
	css: new TemplateFn<JsxInput>((html) => {
		return html`<style>
			input.placeholder {
				color: grey;
			}
		</style>`;
	}, CHANGE_TYPE.NEVER, render),
	html: new TemplateFn<JsxInput>(function (html, props) {
		return (
			<div id="container">
				<h2>{props.name}</h2>
				<input {...{"@": {
					"change": this.onChange,
					"focus": this.onFocus,
					"blur": this.onBlur
				}}} type={props.type} value={props.placeholder} id="input"></input>
			</div>
		)
	}, CHANGE_TYPE.NEVER, render)
})
export class JsxInput extends ConfigurableWebComponent<{
	selectors: {
		IDS: {
			input: HTMLInputElement;
		}
	};
	events: {
		change: {
			args: [string, string]
		}
	};
}> {
	private _lastVal: string = '';

	props = Props.define(this, {
		reflect: {
			name: {
				type: PROP_TYPE.STRING,
				value: 'name',
			},
			placeholder: {
				type: PROP_TYPE.STRING,
				value: 'placeholder'
			},
			type: {
				type: PROP_TYPE.STRING,
				exactType: '' as 'text'|'password'|'tel'|'number',
				value: 'text'
			}
		}
	});

	onChange() {
		const newVal = this.$.input.value;
		if (newVal === this.props.placeholder) return;

		const lastVal = this._lastVal;
		this.fire('change', lastVal, newVal);
		this._lastVal = newVal;
	}

	onFocus() {
		if (this.$.input.value === this.props.placeholder) {
			this.$.input.classList.remove('placeholder');
			this.$.input.value = '';
		}
	}

	onBlur() {
		if (this.$.input.value === '') {
			this.$.input.classList.add('placeholder');
			this.$.input.value = this.props.placeholder;
		}
	}
}