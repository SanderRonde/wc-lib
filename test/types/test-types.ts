import {
    ConfigurableWebComponent,
    Props,
    PROP_TYPE,
    ComplexType,
} from '../../src/wc-lib';

namespace Test {
    export namespace AssignableTo {
        // @ts-expect-error
        export type String<V extends string> = void;
        // @ts-expect-error
        export type Number<V extends number> = void;
        // @ts-expect-error
        export type Bool<V extends boolean> = void;
        // @ts-expect-error
        export type Void<V extends void> = void;

        export namespace Optional {
            // @ts-expect-error
            export type String<V extends string | undefined> = void;
            // @ts-expect-error
            export type Number<V extends number | undefined> = void;
            // @ts-expect-error
            export type Bool<V extends boolean | undefined> = void;
        }
    }

    // @ts-expect-error
    export function type<T>(): T {}

    // @ts-expect-error
    export function useValues(...values: any[]): void {}
}

{
    // JSX props test
    class JSXProptest extends ConfigurableWebComponent<{}> {
        props = Props.define(this, {
            reflect: {
                prop1: {
                    type: PROP_TYPE.STRING,
                },
                prop2: {
                    type: PROP_TYPE.NUMBER,
                },
                prop3: {
                    type: PROP_TYPE.BOOL,
                },
                prop4: {
                    type: ComplexType<JSXProptest>(),
                },
            },
        });
    }

    type JSXProps = JSXProptest['jsxProps'];

    {
        // string|void
        type TestType = JSXProps['prop1'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // number|void
        type TestType = JSXProps['prop2'];

        // @ts-expect-error
        let test1: Test.AssignableTo.Number<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.Number<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // bool|void
        type TestType = JSXProps['prop3'];

        // @ts-expect-error
        let test1: Test.AssignableTo.Bool<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.Bool<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // JSXProptest|void
        type TestType = JSXProps['prop4'];

        // @ts-expect-error
        let test1: JSXProptest = Test.type<TestType>();
        // @ts-expect-error
        let test2: void = Test.type<TestType>();
        let test3: JSXProptest | void = Test.type<TestType>();
        let test4: TestType = Test.type<JSXProptest>();
        let test5: TestType = Test.type<undefined>();

        Test.useValues(test1, test2, test3, test4, test5);
    }
}

{
    // JSX required test
    class RequiredTest extends ConfigurableWebComponent<{}> {
        props = Props.define(this, {
            reflect: {
                requiredValue: {
                    type: PROP_TYPE.STRING,
                    value: null,
                    required: true,
                },
                optionalValue: {
                    type: PROP_TYPE.STRING,
                    value: null,
                    required: false,
                },
            },
        });
    }

    type JSXProps = RequiredTest['jsxProps'];

    {
        // string
        type TestType = JSXProps['requiredValue'];

        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;

        Test.useValues(test1, test2);
    }

    {
        type TestType = JSXProps['optionalValue'];

        // string|void

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }
}
