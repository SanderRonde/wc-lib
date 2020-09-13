import {
    ConfigurableWebComponent,
    config,
    TemplateFn,
    CHANGE_TYPE,
    Props,
    ComplexType,
    PROP_TYPE,
} from '../../../../../../build/es/wc-lib.js';
import {
    render,
    html,
    directive,
    Part,
} from '../../../../../../node_modules/lit-html/lit-html.js';
import type { RenderableComponent } from '../../../../../types/test-types.js';
import { TestElement } from '../../elements/test-element.js';

export declare class EventTriggeringElement extends ConfigurableWebComponent<{
    events: {
        ev: {
            args: [number, number];
            returnType: number | void;
        };
    };
}> {}

export declare class ComplexReceiverElement extends ConfigurableWebComponent {
    props: { parent: ComplexElement };
}

export declare class BooleanElement extends ConfigurableWebComponent {
    props: { bool: boolean };
}

export declare class ComplexElement extends ConfigurableWebComponent {
    clickHandler(_arg?: any): void;
    customClickHandler(_num: number): void;
    handleEvent(_arg?: any): void;
}

export declare class WrongElementListen extends ConfigurableWebComponent {}

export function complexElementFactory(base: typeof RenderableComponent) {
    @config({
        is: 'event-triggering-element',
        html: new TemplateFn<EventTriggeringElement>(
            () => {
                return html``;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    class EventTriggeringElement extends base<{
        events: {
            ev: {
                args: [number];
            };
        };
    }> {}

    @config({
        is: 'complex-receiver-element',
        html: new TemplateFn<ComplexReceiverElement>(
            () => {
                return html``;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    class ComplexReceiverElement extends ConfigurableWebComponent {
        props = Props.define(this, {
            reflect: {
                parent: ComplexType<_ComplexElement>(),
            },
        });
    }

    @config({
        is: 'boolean-element',
        html: new TemplateFn<EventTriggeringElement>(
            () => {
                return html``;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    class BooleanElement extends ConfigurableWebComponent {
        props = Props.define(this, {
            reflect: {
                bool: PROP_TYPE.BOOL,
            },
        });
    }

    const resolveDirectiveWith = directive(<T>(value: T) => (part: Part) => {
        part.setValue(value);
        part.commit();
    });

    const changeValueDirective = directive(
        <T>(val1: T, val2: T, time: number = 250) => (part: Part) => {
            part.setValue(val1);
            part.commit();

            window.setTimeout(() => {
                part.setValue(val2);
                part.commit();
            }, time);
        }
    );

    @config({
        is: 'complex-element',
        html: new TemplateFn<_ComplexElement>(
            function (html) {
                return html`
                    <test-element
                        id="eventTest"
                        @click="${() => {
                            // Done so the function can be stubbed
                            this.clickHandler();
                        }}"
                    ></test-element>
                    <test-element
                        id="eventTest2"
                        on-click="${() => {
                            // Done so the function can be stubbed
                            this.clickHandler();
                        }}"
                    ></test-element>
                    <test-element
                        id="eventDirective"
                        @click="${resolveDirectiveWith(() => {
                            // Done so the function can be stubbed
                            this.clickHandler();
                        })}"
                    ></test-element>
                    <event-triggering-element
                        id="customEventTest"
                        @@ev="${(arg1: number, arg2: number) => {
                            // Done so the function can be stubbed
                            return this.customClickHandler(arg1, arg2);
                        }}"
                    ></event-triggering-element>
                    <event-triggering-element
                        id="customEventTest2"
                        on--ev="${(arg1: number, arg2: number) => {
                            // Done so the function can be stubbed
                            return this.customClickHandler(arg1, arg2);
                        }}"
                    ></event-triggering-element>
                    <event-triggering-element
                        id="customEventDirective"
                        @@ev="${resolveDirectiveWith(
                            (arg1: number, arg2: number) => {
                                // Done so the function can be stubbed
                                return this.customClickHandler(arg1, arg2);
                            }
                        )}"
                    ></event-triggering-element>
                    <event-triggering-element
                        id="customEventReplaced"
                        @@ev="${changeValueDirective(
                            (arg1: number) => {
                                // Done so the function can be stubbed
                                return this.customClickHandler(arg1 + 1);
                            },
                            (arg1: number) => {
                                // Done so the function can be stubbed
                                return this.customClickHandler(arg1 + 2);
                            }
                        )}"
                    ></event-triggering-element>
                    <event-triggering-element
                        id="customEventRemoved"
                        @@ev="${changeValueDirective(
                            (arg1: number, arg2: number) => {
                                // Done so the function can be stubbed
                                return this.customClickHandler(arg1, arg2);
                            },
                            null
                        )}"
                    ></event-triggering-element>
                    <event-triggering-element
                        id="customEventDefined"
                        @@ev="${changeValueDirective(
                            null,
                            (arg1: number, arg2: number) => {
                                // Done so the function can be stubbed
                                return this.customClickHandler(arg1, arg2);
                            }
                        )}"
                    ></event-triggering-element>
                    <event-triggering-element
                        id="handleEvent"
                        @@ev="${this}"
                    ></event-triggering-element>
                    <!-- {} is truthy -->
                    <boolean-element
                        id="booleanTestTrue"
                        ?bool="${{}}"
                    ></boolean-element>
                    <!-- '' is false -->
                    <boolean-element
                        id="booleanTestFalse"
                        ?bool="${''}"
                    ></boolean-element>
                    <div
                        id="classTestObj"
                        class="${{
                            a: true,
                            b: false,
                        }}"
                    ></div>
                    <div id="classTestString" class="${'a b c'}"></div>
                    <div
                        id="classTestArr"
                        class="${[
                            {
                                a: true,
                                b: false,
                            },
                            'c',
                            'd',
                            {
                                e: true,
                                f: false,
                            },
                        ]}"
                    ></div>
                    <div
                        id="classDirective"
                        class="${resolveDirectiveWith('a b c')}"
                    ></div>
                    <div
                        id="styleTestObj"
                        style="${{ color: 'red', backgroundColor: 'blue' }}"
                    ></div>
                    <div
                        id="styleTestString"
                        style="${'color: red; background-color: blue;'}"
                    ></div>
                    <div
                        id="styleDirective"
                        style="${resolveDirectiveWith(
                            'color: red; background-color: blue;'
                        )}"
                    ></div>
                    <complex-receiver-element
                        id="refTest"
                        #parent="${this}"
                    ></complex-receiver-element>
                    <complex-receiver-element
                        id="refDirective"
                        #parent="${resolveDirectiveWith(this)}"
                    ></complex-receiver-element>
                    <test-element
                        id="refTest2"
                        #parent="${this}"
                    ></test-element>
                    <complex-receiver-element
                        id="refTest3"
                        parent="${this}"
                    ></complex-receiver-element>
                    <test-element id="refTest4" x="${this}"></test-element>
                    <test-element id="regular" :key="${'value'}"></test-element>
                `;
            },
            CHANGE_TYPE.PROP,
            render
        ),
        dependencies: [
            TestElement,
            EventTriggeringElement,
            ComplexReceiverElement,
            BooleanElement,
        ] as any,
    })
    class _ComplexElement extends ConfigurableWebComponent {
        clickHandler(_arg?: any) {
            // Will be stubbed
        }

        customClickHandler(_num1: number, _num2?: number) {
            // Will be stubbed
        }

        handleEvent(_arg?: any) {
            // Will be stubbed
        }
    }

    @config({
        is: 'wrong-element-listen',
        html: new TemplateFn<_WrongElementListen>(
            (html) => {
                return html`
                    <div id="customEventDirective" @@ev="${() => {}}"></div>
                `;
            },
            CHANGE_TYPE.PROP,
            render
        ),
    })
    class _WrongElementListen extends ConfigurableWebComponent {}

    return {
        ComplexElement: _ComplexElement as typeof ComplexElement,
        WrongElementListen: _WrongElementListen as typeof WrongElementListen,
    };
}
