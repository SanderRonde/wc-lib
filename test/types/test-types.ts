import { DefaultVal } from '../../build/es/classes/types';
import { GetRenderArgsBaseMixin } from '../../build/es/lib/base';
import {
    GetRenderArgsHierarchyManagerMixin,
    GlobalPropsFunctions,
} from '../../build/es/lib/hierarchy-manager';
import { GetRenderArgsThemeManagerMixin } from '../../build/es/lib/theme-manager';
import {
    CHANGE_TYPE,
    EventListenerObj,
    SelectorMap,
} from '../../build/es/wc-lib';
import {
    ConfigurableWebComponent,
    Props,
    PROP_TYPE,
    ComplexType,
    Watchable,
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
        // @ts-expect-error
        export type Never<V extends never> = void;
        // @ts-expect-error
        export type Undefined<V extends undefined> = void;

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
    export function type<T>(_v?: T): T {}

    // @ts-expect-error
    export function useValues(...values: any[]): void {}
}

{
    interface ObjectTestType {
        a: string;
        b: number;
        c: boolean;
    }

    // JSX props test
    class JSXProptest extends ConfigurableWebComponent<{
        themes: {
            light: ObjectTestType;
            dark: ObjectTestType;
        };
        globalProps: ObjectTestType;
        subtreeProps: ObjectTestType;
    }> {
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
                prop5: {
                    type: PROP_TYPE.STRING,
                    value: 'something',
                },
                prop6: {
                    type: PROP_TYPE.STRING,
                    defaultValue: 'something',
                },
                prop7: {
                    type: PROP_TYPE.STRING,
                    isDefined: true,
                },
                prop8: {
                    type: PROP_TYPE.STRING,
                    required: true,
                },
                prop9: {
                    type: PROP_TYPE.STRING,
                    isDefined: false,
                    value: 'something',
                },
                prop10: {
                    type: PROP_TYPE.STRING,
                    isDefined: false,
                },
                prop11: {
                    type: PROP_TYPE.STRING,
                    required: false,
                    value: 'something',
                },
                prop12: {
                    type: PROP_TYPE.STRING,
                    required: false,
                },
                prop13: {
                    type: PROP_TYPE.STRING,
                    coerce: true,
                },
                prop14: {
                    type: PROP_TYPE.STRING,
                    exactType: '' as 'x' | 'y' | 'z' | undefined,
                },
                prop15: {
                    type: PROP_TYPE.STRING,
                    exactType: '' as 'x' | 'y' | 'z',
                    required: true,
                },
                prop16: {
                    type: ComplexType<string>(),
                },
                prop17: {
                    type: PROP_TYPE.STRING_REQUIRED,
                },
                prop18: {
                    type: PROP_TYPE.STRING_REQUIRED,
                    required: false,
                },
                prop19: {
                    type: PROP_TYPE.STRING_OPTIONAL,
                },
                prop20: {
                    type: PROP_TYPE.STRING_OPTIONAL,
                    required: true,
                },
                prop21: {
                    type: ComplexType<string>().optional(),
                },
                prop22: {
                    type: ComplexType<string>().optional(),
                    required: true,
                },
                prop23: {
                    type: ComplexType<string>().required(),
                },
                prop24: {
                    type: ComplexType<string>().required(),
                    required: false,
                },
                prop25: PROP_TYPE.STRING,
                prop26: PROP_TYPE.STRING_REQUIRED,
                prop27: PROP_TYPE.STRING_OPTIONAL,
                prop28: ComplexType<string>(),
                prop29: ComplexType<string>().optional(),
                prop30: ComplexType<string>().required(),
            },
        });

        fn() {
            // Prop types tests
            {
                // string|void
                type TestType = this['props']['prop1'];

                this.props.prop1;

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // number|void
                type TestType = this['props']['prop2'];

                // @ts-expect-error
                let test1: Test.AssignableTo.Number<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.Number<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // bool|void
                type TestType = this['props']['prop3'];

                // @ts-expect-error
                let test1: Test.AssignableTo.Bool<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.Bool<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // JSXProptest|void
                type TestType = this['props']['prop4'];
                this.props.prop4;

                // @ts-expect-error
                let test1: JSXProptest = Test.type<TestType>();
                // @ts-expect-error
                let test2: void = Test.type<TestType>();
                let test3: JSXProptest | void = Test.type<TestType>();
                let test4: TestType = Test.type<JSXProptest>();
                let test5: TestType = Test.type<undefined>();

                Test.useValues(test1, test2, test3, test4, test5);
            }

            {
                // string
                type TestType = this['props']['prop5'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string
                type TestType = this['props']['prop6'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string
                type TestType = this['props']['prop7'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string
                type TestType = this['props']['prop8'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string|void
                type TestType = this['props']['prop9'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = this['props']['prop10'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = this['props']['prop11'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = this['props']['prop12'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string
                type TestType = this['props']['prop13'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // 'x'|'y'|'z'|undefined
                type TestType = this['props']['prop14'];

                // @ts-expect-error
                type ExactType<V extends 'x' | 'y' | 'z' | undefined> = void;

                let test1: ExactType<TestType>;

                Test.useValues(test1);
            }

            {
                // 'x'|'y'|'z'
                type TestType = this['props']['prop15'];

                // @ts-expect-error
                type ExactType<V extends 'x' | 'y' | 'z'> = void;

                let test1: ExactType<TestType>;

                Test.useValues(test1);
            }

            {
                // string|void
                type TestType = this['props']['prop16'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string
                type TestType = this['props']['prop17'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string
                type TestType = this['props']['prop18'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string|void
                type TestType = this['props']['prop19'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = this['props']['prop20'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = this['props']['prop21'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = this['props']['prop22'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string
                type TestType = this['props']['prop23'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string
                type TestType = this['props']['prop24'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string|void
                type TestType = this['props']['prop25'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string
                type TestType = this['props']['prop26'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string|void
                type TestType = this['props']['prop27'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = this['props']['prop28'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = this['props']['prop29'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string
                type TestType = this['props']['prop30'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }
        }

        fn2() {
            // Render arg props tests
            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop1'];

                this.props.prop1;

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // number|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop2'];

                // @ts-expect-error
                let test1: Test.AssignableTo.Number<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.Number<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // bool|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop3'];

                // @ts-expect-error
                let test1: Test.AssignableTo.Bool<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.Bool<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // JSXProptest|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop4'];
                this.props.prop4;

                // @ts-expect-error
                let test1: JSXProptest = Test.type<TestType>();
                // @ts-expect-error
                let test2: void = Test.type<TestType>();
                let test3: JSXProptest | void = Test.type<TestType>();
                let test4: TestType = Test.type<JSXProptest>();
                let test5: TestType = Test.type<undefined>();

                Test.useValues(test1, test2, test3, test4, test5);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop5'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop6'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop7'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop8'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop9'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop10'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop11'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop12'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop13'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // 'x'|'y'|'z'|undefined
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop14'];

                // @ts-expect-error
                type ExactType<V extends 'x' | 'y' | 'z' | undefined> = void;

                let test1: ExactType<TestType>;

                Test.useValues(test1);
            }

            {
                // 'x'|'y'|'z'
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop15'];

                // @ts-expect-error
                type ExactType<V extends 'x' | 'y' | 'z'> = void;

                let test1: ExactType<TestType>;

                Test.useValues(test1);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop16'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop17'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop18'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop19'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop20'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop21'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop22'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop23'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop24'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop25'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop26'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop27'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop28'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string|void
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop29'];

                // @ts-expect-error
                let test1: Test.AssignableTo.String<TestType>;
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;
                let test3: Test.AssignableTo.Optional.String<TestType>;

                Test.useValues(test1, test2, test3);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['props']['prop30'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }
        }

        fn3() {
            // Render args theme tests
            {
                // ThemeType
                type TestType = ReturnType<this['getRenderArgs']>['theme'];

                let test1: TestType = Test.type<Watchable<ObjectTestType>>();
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;

                Test.useValues(test1, test2);
            }

            {
                // string
                type TestType = ReturnType<this['getRenderArgs']>['theme']['a'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // number
                type TestType = ReturnType<this['getRenderArgs']>['theme']['b'];

                let test1: Test.AssignableTo.Number<TestType>;

                Test.useValues(test1);
            }

            {
                // boolean
                type TestType = ReturnType<this['getRenderArgs']>['theme']['c'];

                let test1: Test.AssignableTo.Bool<TestType>;

                Test.useValues(test1);
            }
        }

        fn4() {
            // Render args global props tests
            {
                // ThemeType
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['globalProps'];

                let test1: TestType = Test.type<Watchable<ObjectTestType>>();
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;

                Test.useValues(test1, test2);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['globalProps']['a'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // number
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['globalProps']['b'];

                let test1: Test.AssignableTo.Number<TestType>;

                Test.useValues(test1);
            }

            {
                // boolean
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['globalProps']['c'];

                let test1: Test.AssignableTo.Bool<TestType>;

                Test.useValues(test1);
            }
        }

        fn5() {
            // Render args subtree props tests
            {
                // ThemeType
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['subtreeProps'];

                let test1: TestType = Test.type<Watchable<ObjectTestType>>();
                // @ts-expect-error
                let test2: Test.AssignableTo.Void<TestType>;

                Test.useValues(test1, test2);
            }

            {
                // string
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['subtreeProps']['a'];

                let test1: Test.AssignableTo.String<TestType>;

                Test.useValues(test1);
            }

            {
                // number
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['subtreeProps']['b'];

                let test1: Test.AssignableTo.Number<TestType>;

                Test.useValues(test1);
            }

            {
                // boolean
                type TestType = ReturnType<
                    this['getRenderArgs']
                >['subtreeProps']['c'];

                let test1: Test.AssignableTo.Bool<TestType>;

                Test.useValues(test1);
            }
        }
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

    {
        // string|void
        type TestType = JSXProps['prop5'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop6'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop7'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string
        type TestType = JSXProps['prop8'];

        let test1: Test.AssignableTo.String<TestType>;

        Test.useValues(test1);
    }

    {
        // string|void
        type TestType = JSXProps['prop9'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop10'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop11'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop12'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop13'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // 'x'|'y'|'z'|undefined
        type TestType = JSXProps['prop14'];

        // @ts-expect-error
        type ExactType<V extends 'x' | 'y' | 'z' | undefined> = void;

        let test1: ExactType<TestType>;

        Test.useValues(test1);
    }

    {
        // 'x'|'y'|'z'
        type TestType = JSXProps['prop15'];

        // @ts-expect-error
        type ExactType<V extends 'x' | 'y' | 'z'> = void;

        let test1: ExactType<TestType>;

        Test.useValues(test1);
    }

    {
        // string|void
        type TestType = JSXProps['prop16'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string
        type TestType = JSXProps['prop17'];

        let test1: Test.AssignableTo.String<TestType>;

        Test.useValues(test1);
    }

    {
        // string
        type TestType = JSXProps['prop18'];

        let test1: Test.AssignableTo.String<TestType>;

        Test.useValues(test1);
    }

    {
        // string|void
        type TestType = JSXProps['prop19'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop20'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop21'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop22'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string
        type TestType = JSXProps['prop23'];

        let test1: Test.AssignableTo.String<TestType>;

        Test.useValues(test1);
    }

    {
        // string
        type TestType = JSXProps['prop24'];

        let test1: Test.AssignableTo.String<TestType>;

        Test.useValues(test1);
    }

    {
        // string|void
        type TestType = JSXProps['prop25'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string
        type TestType = JSXProps['prop26'];

        let test1: Test.AssignableTo.String<TestType>;

        Test.useValues(test1);
    }

    {
        // string|void
        type TestType = JSXProps['prop27'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop28'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string|void
        type TestType = JSXProps['prop29'];

        // @ts-expect-error
        let test1: Test.AssignableTo.String<TestType>;
        // @ts-expect-error
        let test2: Test.AssignableTo.Void<TestType>;
        let test3: Test.AssignableTo.Optional.String<TestType>;

        Test.useValues(test1, test2, test3);
    }

    {
        // string
        type TestType = JSXProps['prop30'];

        let test1: Test.AssignableTo.String<TestType>;

        Test.useValues(test1);
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

export declare class RenderableComponent<
    GA extends {
        i18n?: any;
        langs?: string;
        events?: EventListenerObj;
        themes?: {
            [key: string]: any;
        };
        selectors?: SelectorMap;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        };
        subtreeProps?: {
            [key: string]: any;
        };
    } = {}
> {
    getRenderArgs(
        changeType: CHANGE_TYPE | number
    ): GetRenderArgsBaseMixin<this> &
        GetRenderArgsThemeManagerMixin<this> &
        GetRenderArgsHierarchyManagerMixin<this>;

    getTheme(): GA['themes'][keyof GA['themes']];

    getSubTreeProps(): GA['subtreeProps'];

    globalProps: GlobalPropsFunctions<
        DefaultVal<GA['globalProps'], { [key: string]: any }>
    >;

    connectedCallback(): void;
    disconnectedCallback(): void;

    static define(isDev?: boolean): void;
}
