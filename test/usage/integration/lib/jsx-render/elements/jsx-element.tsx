import {
    TemplateResult,
    PropertyCommitter,
    PropertyPart,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    isDirective,
    directive,
    noChange,
    render,
    html as litHTMLHTML,
} from '../../.../../../../../../node_modules/lit-html/lit-html.js';
import {
    ConfigurableWebComponent,
    config,
    TemplateFn,
    CHANGE_TYPE,
    Props,
    PROP_TYPE,
    ComplexType,
    ClassNamesArg,
    WebComponent,
    jsxToLiteral,
    html,
} from '../../../../../../build/es/wc-lib.js';
import { JSXElementLiteral } from '../../../../../../build/es/lib/jsx-render.js';
import { JSXTemplater } from '../../../../../../build/es/lib/template-fn';

WebComponent.initComplexTemplateProvider({
    TemplateResult,
    PropertyCommitter,
    PropertyPart,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    directive,
    isDirective,
    noChange,
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
            class?: string | ClassNamesArg | ClassNamesArg[];
        }
    }
}

@config({
    is: 'other-class',
    html: new TemplateFn<JSXElement>(
        (html) => {
            return <div id="content"></div>;
        },
        CHANGE_TYPE.NEVER,
        render
    ),
    css: null,
})
export class OtherClass extends ConfigurableWebComponent {
    isOtherClass() {
        return true;
    }
}

@config({
    is: 'special-prop-class',
    html: new TemplateFn<JSXElement>(
        (html) => {
            return <div id="content"></div>;
        },
        CHANGE_TYPE.NEVER,
        render
    ),
    css: null,
})
export class SpecialPropClass extends ConfigurableWebComponent<
    {},
    {
        something: {
            args: [];
        };
        other: {
            args: any[];
        };
    }
> {
    props = Props.define(this, {
        reflect: {
            regular: PROP_TYPE.STRING,
            bool: PROP_TYPE.BOOL,
            boolType: {
                type: PROP_TYPE.BOOL,
            },
            complex: {
                type: ComplexType<{}>(),
                watch: false,
            },
            complexType: {
                type: ComplexType<{}>(),
                watch: false,
            },
        },
        priv: {
            complexpriv: {
                type: ComplexType<{}>(),
                watch: false,
            },
        },
    });
}

const jsxFn: JSXTemplater<JSXElementLiteral>['jsx'] = (
    tag,
    attrs,
    ...children
) => {
    const { strings, values } = jsxToLiteral(
        tag,
        attrs,
        ...children
    ) as JSXElementLiteral;
    return litHTMLHTML(strings, ...values);
};

function FnWithoutArgs() {
    const html = { jsx: jsxFn };
    return <div id="fnWithoutArgs"></div>;
}

function FnWithArgs(props: { a: number; b: number }) {
    const { a, b } = props;
    const html = { jsx: jsxFn };
    // @ts-ignore
    return <div id="fnWithArgs" a={a} b={b}></div>;
}

@config({
    is: 'jsx-render',
    html: new TemplateFn<JSXElement>(
        function (html, { props }) {
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
                    <SpecialPropClass
                        {...{
                            '@': {
                                click: () => {
                                    this.onEvent();
                                },
                            },
                        }}
                        id="listener-at"
                    />
                    <SpecialPropClass
                        __listeners={{
                            click: () => {
                                this.onEvent();
                            },
                        }}
                        id="listener-group"
                    />
                    <SpecialPropClass
                        __component_listeners={{
                            something: () => {
                                this.onEvent();
                            },
                        }}
                        {...{
                            '@@': {
                                other: () => {
                                    this.onEvent();
                                },
                            },
                        }}
                        id="special-listeners"
                    />
                    <SpecialPropClass
                        __bools={{
                            bool: true,
                        }}
                        {...{
                            '?': {
                                boolType: true,
                            },
                        }}
                        id="bool-true"
                    />
                    <SpecialPropClass
                        __bools={{
                            bool: false,
                        }}
                        {...{
                            '?': {
                                boolType: false,
                            },
                        }}
                        id="bool-false"
                    />
                    <SpecialPropClass
                        __refs={{
                            complex: props.someComplex,
                        }}
                        {...{
                            '#': {
                                complexType: props.someComplex,
                            },
                        }}
                        id="refs"
                    />
                    <SpecialPropClass
                        {...{
                            '@click': () => {
                                this.onEvent();
                            },
                        }}
                        id="listener-name"
                    />
                    <SpecialPropClass
                        {...{
                            '@@something': () => {
                                this.onEvent();
                            },
                        }}
                        id="special-listener-name"
                    />
                    <SpecialPropClass
                        {...{ '?bool': true }}
                        id="bool-true-name"
                    />
                    <SpecialPropClass
                        {...{ '?bool': false }}
                        id="bool-false-name"
                    />
                    <SpecialPropClass
                        class={{
                            a: true,
                            b: false,
                            c: true,
                        }}
                        id="class-name"
                    />
                    <SpecialPropClass
                        {...{ '#complex': props.someComplex }}
                        id="refs-name"
                    />
                    <SpecialPropClass
                        complex={props.someComplex}
                        id="refs-name2"
                    />
                    <SpecialPropClass
                        complexpriv={props.someComplex}
                        id="refs-name3"
                    />
                    {html.jsx(12345 as any, null)}
                    <FnWithoutArgs />
                    <FnWithArgs a={1} b={2} />
                </div>
            );
        },
        CHANGE_TYPE.PROP,
        render
    ),
    css: null,
    dependencies: [OtherClass, SpecialPropClass],
})
export class JSXElement extends ConfigurableWebComponent {
    props = Props.define(this, {
        reflect: {
            x: {
                type: PROP_TYPE.STRING,
                value: 'x',
            },
            y: {
                type: PROP_TYPE.NUMBER,
                value: 1,
            },
            childContent: PROP_TYPE.STRING,
            childTag: PROP_TYPE.STRING,
            children: {
                type: ComplexType<string[]>(),
                value: [],
            },
            someComplex: ComplexType<{}>(),
        },
    });

    onEvent() {}
}

@config({
    is: 'jsx-render-2',
    html: new TemplateFn<JSXElement2>(
        function (html) {
            return <div>{false && <div id="not-rendered"></div>}</div>;
        },
        CHANGE_TYPE.PROP,
        render
    ),
    css: null,
})
export class JSXElement2 extends ConfigurableWebComponent {
    onEvent() {}
}

@config({
    is: 'jsx-render-3',
    html: new TemplateFn<JSXElement3>(
        function (html) {
            return (
                <html.Fragment>
                    <div id="1"></div>
                    <div id="2"></div>
                    <div id="3"></div>
                </html.Fragment>
            );
        },
        CHANGE_TYPE.PROP,
        render
    ),
    css: null,
})
export class JSXElement3 extends ConfigurableWebComponent {}

@config({
    is: 'jsx-render-4',
    html: new TemplateFn<JSXElement4>(
        function (html) {
            return (
                <html.F>
                    <div id="1"></div>
                    <div id="2"></div>
                    <div id="3"></div>
                </html.F>
            );
        },
        CHANGE_TYPE.PROP,
        render
    ),
    css: null,
})
export class JSXElement4 extends ConfigurableWebComponent {}

function RendererWithoutTemplater() {
    return <div id="4"></div>;
}

@config({
    is: 'jsx-render-5',
    html: new TemplateFn<JSXElement5>(
        function (html) {
            return (
                <html.F>
                    <div id="1"></div>
                    <div id="2"></div>
                    <div id="3"></div>
                    <RendererWithoutTemplater />
                </html.F>
            );
        },
        CHANGE_TYPE.PROP,
        render
    ),
    css: null,
})
export class JSXElement5 extends ConfigurableWebComponent {}

@config({
    is: 'jsx-render-6',
    html: new TemplateFn<JSXElement6>(
        function () {
            return (
                <html.F>
                    <div id="1"></div>
                    <div id="2"></div>
                    <div id="3"></div>
                    <RendererWithoutTemplater />
                </html.F>
            );
        },
        CHANGE_TYPE.PROP,
        render
    ),
    css: null,
})
export class JSXElement6 extends ConfigurableWebComponent {}

@config({
    is: 'jsx-render-7',
    html: new TemplateFn<JSXElement7>(
        function () {
            return (
                <html.Fragment>
                    <div id="1"></div>
                    <div id="2"></div>
                    <div id="3"></div>
                    <RendererWithoutTemplater />
                </html.Fragment>
            );
        },
        CHANGE_TYPE.NEVER,
        render
    ),
    css: null,
})
export class JSXElement7 extends ConfigurableWebComponent {}

@config({
    is: 'jsx-undefined-element',
    html: new TemplateFn<JSXElement6>(
        function () {
            return (
                <html.Fragment>
                    <div id="1"></div>
                    <div id="2"></div>
                    <div id="3"></div>
                    <RendererWithoutTemplater />
                </html.Fragment>
            );
        },
        CHANGE_TYPE.NEVER,
        render
    ),
    css: null,
})
export class JSXUndefinedElement extends ConfigurableWebComponent {}

@config({
    is: 'jsx-render-8',
    html: new TemplateFn<JSXElement8>(
        function () {
            return (
                <html.Fragment>
                    <JSXUndefinedElement />
                </html.Fragment>
            );
        },
        CHANGE_TYPE.NEVER,
        render
    ),
    css: null,
})
export class JSXElement8 extends ConfigurableWebComponent {}

@config({
    is: 'jsx-render-9',
    html: new TemplateFn<JSXElement9>(
        function () {
            return (
                <html.Fragment>
                    <div id="1"></div>
                    <div id="2"></div>
                    <div id="3"></div>
                    {[[[[<RendererWithoutTemplater />]]], <div id="5"></div>]}
                </html.Fragment>
            );
        },
        CHANGE_TYPE.NEVER,
        render
    ),
    css: null,
})
export class JSXElement9 extends ConfigurableWebComponent {}

(window as any).JSXUndefinedElement = JSXUndefinedElement;
