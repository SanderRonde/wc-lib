import { ConfigurableWebComponent, config, TemplateFn, CHANGE_TYPE, Props, PROP_TYPE, ComplexType, ClassNamesArg, WebComponent } from "../../../../../../build/es/wc-lib.js";
import { TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange, render 
} from "../../.../../../../../../node_modules/lit-html/lit-html.js";

WebComponent.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});

declare global {
	namespace JSX {
		interface IntrinsicElements {
			div: {
				id?: string;
				x?: string;
				y?: number;
			};
			unknown: {};
			a: {};
			b: {};
		}
		interface ElementAttributesProperty {
			jsxProps: 'jsxProps';
		}
		interface IntrinsicAttributes {
			id?: string;
			class?: string|ClassNamesArg|ClassNamesArg[];
		}
	}
}

@config({
	is: 'other-class',
	html: new TemplateFn<JSXElement>((html) => {
		return (
			<div id="content"></div>
		);
	}, CHANGE_TYPE.NEVER, render),
	css: null
})
export class OtherClass extends ConfigurableWebComponent { 
	isOtherClass() {
		return true;
	}
}

@config({
	is: 'special-prop-class',
	html: new TemplateFn<JSXElement>((html) => {
		return (
			<div id="content"></div>
		);
	}, CHANGE_TYPE.NEVER, render),
	css: null
})
export class SpecialPropClass extends ConfigurableWebComponent<{}, {
	something: {
		args: []
	}
	other: {
		args: any[];
	}
}> { 
	props = Props.define(this, {
		reflect: {
			regular: PROP_TYPE.STRING,
			bool: PROP_TYPE.BOOL,
			boolType: {
				type: PROP_TYPE.BOOL
			},
			complex: {
				type: ComplexType<{}>(),
				watch: false
			},
			complexType: {
				type: ComplexType<{}>(),
				watch: false
			}
		}
	});
}

@config({
	is: 'jsx-render',
	html: new TemplateFn<JSXElement>(function (html, props) {
		return (
			<div>
				<div x={props.x} y={props.y} id="simple"></div>
				<div id="nested">
					<div>
						<div id="nestedChild"></div>
					</div>
					<div></div>
					<div></div>
				</div>
				<div id="singleChildWithAttrs">
					<div></div>
				</div>
				<unknown></unknown>
				<OtherClass id="classComponent"></OtherClass>
				<SpecialPropClass {...{"@": {
					click: () => {
						this.onEvent();
					}
				}}} id="listener-at" />
				<SpecialPropClass __listeners={{
					click: () => {
						this.onEvent();
					}
				}} id="listener-group" />
				<SpecialPropClass __component_listeners={{
					something: () => {
						this.onEvent();
					}
				}} {...{"@@": {
					other: () => {
						this.onEvent();
					}
				}}} id="special-listeners" />
				<SpecialPropClass __bools={{
					bool: true
				}} {...{"?": {
					boolType: true
				}}} id="bool-true" />
				<SpecialPropClass __bools={{
					bool: false
				}} {...{"?": {
					boolType: false
				}}} id="bool-false" />
				<SpecialPropClass __refs={{
					complex: props.someComplex
				}} {...{"#": {
					complexType: props.someComplex
				}}} id="refs" />
				
				<SpecialPropClass {...{"@click": () => {
					this.onEvent();
				}}} id="listener-name" />
				<SpecialPropClass {...{"@@something": () => {
					this.onEvent();
				}}} id="special-listener-name" />
				<SpecialPropClass {...{"?bool": true}} id="bool-true-name" />
				<SpecialPropClass {...{"?bool": false}} id="bool-false-name" />
				<SpecialPropClass class={{
					"a": true,
					"b": false,
					"c": true
				}} id="class-name" />
				<SpecialPropClass {...{"#complex": props.someComplex }} id="refs-name" />
			</div>
		)
	}, CHANGE_TYPE.PROP, render),
	css: null,
	dependencies: [ 
		OtherClass,
		SpecialPropClass
	]
})
export class JSXElement extends ConfigurableWebComponent {
	props = Props.define(this, {
		reflect: {
			x: {
				type: PROP_TYPE.STRING,
				value: 'x'
			},
			y: {
				type: PROP_TYPE.NUMBER,
				value: 1
			},
			childContent: PROP_TYPE.STRING,
			childTag: PROP_TYPE.STRING,
			children: {
				type: ComplexType<string[]>(),
				value: []
			},
			someComplex: ComplexType<{}>()
		}
	});

	onEvent() { }
}