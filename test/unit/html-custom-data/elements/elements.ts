import { config, Props, PROP_TYPE } from '../../../../build/cjs/wc-lib.js';
import {
    render as _render,
    html as _html,
    // @ts-ignore
} from '../../../modules/lit-html.js';

export function elementFactory<
    C extends {
        define(isRoot?: boolean): void;
        new (...args: any[]): {};
    }
>(base: C) {
    type CStatic = C & {
        __prom(key: string, ...values: any[]): Promise<string>;
        __(key: string, ...values: any[]): string;
    };
    const typedBase = (base as unknown) as CStatic & {
        new (...args: any[]): {
            __prom(key: string, ...values: any[]): Promise<string | undefined>;
            __(key: string, ...values: any[]): string | undefined;
            props: any;
            constructor: CStatic;
        };
    };

    @config({
        is: 'no-props',
        html: null,
    })
    //@ts-ignore
    class NoProps extends typedBase {
        constructor() {
            super();
        }
    }

    @config({
        is: 'priv-data',
        html: null,
    })
    //@ts-ignore
    class PrivData extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            priv: {
                a: PROP_TYPE.STRING,
                b: PROP_TYPE.STRING,
                c: PROP_TYPE.STRING,
            },
        });
    }

    @config({
        is: 'reflect-data',
        html: null,
    })
    //@ts-ignore
    class ReflectData extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                a: PROP_TYPE.STRING,
                b: PROP_TYPE.STRING,
                c: PROP_TYPE.STRING,
            },
        });
    }

    @config({
        is: 'joined-data',
        html: null,
    })
    //@ts-ignore
    class JoinedData extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            priv: {
                a: PROP_TYPE.STRING,
                b: PROP_TYPE.STRING,
                c: PROP_TYPE.STRING,
            },
            reflect: {
                d: PROP_TYPE.STRING,
                e: PROP_TYPE.STRING,
                f: PROP_TYPE.STRING,
            },
        });
    }

    @config({
        is: 'component-description',
        html: null,
        description: 'Some description',
    })
    //@ts-ignore
    class ComponentDescription extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                d: PROP_TYPE.STRING,
                e: PROP_TYPE.STRING,
                f: PROP_TYPE.STRING,
            },
        });
    }

    @config({
        is: 'casing-test',
        html: null,
    })
    //@ts-ignore
    class CasingTest extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                camelCase: PROP_TYPE.STRING,
                'uses-dashes': PROP_TYPE.STRING,
            },
        });
    }

    @config({
        is: 'attribute-description',
        html: null,
    })
    //@ts-ignore
    class AttributeDescription extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                a: {
                    type: PROP_TYPE.STRING,
                    description: 'Some description',
                },
                b: {
                    type: PROP_TYPE.STRING,
                },
            },
        });
    }

    @config({
        is: 'regular-one',
        html: null,
    })
    //@ts-ignore
    class RegularOne extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                a: {
                    type: PROP_TYPE.STRING,
                    description: 'description a',
                },
                b: {
                    type: PROP_TYPE.STRING,
                    description: 'description b',
                },
                c: {
                    type: PROP_TYPE.STRING,
                    description: 'description c',
                },
            },
        });
    }

    @config({
        is: 'regular-two',
        html: null,
    })
    //@ts-ignore
    class RegularTwo extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                c: {
                    type: PROP_TYPE.STRING,
                    description: 'description c',
                },
                d: {
                    type: PROP_TYPE.STRING,
                    description: 'description d',
                },
                e: {
                    type: PROP_TYPE.STRING,
                    description: 'description e',
                },
            },
        });
    }

    @config({
        is: 'nested-component',
        html: null,
        dependencies: [RegularOne, RegularTwo],
    })
    //@ts-ignore
    class NestedComponent extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                e: {
                    type: PROP_TYPE.STRING,
                    description: 'description e',
                },
                f: {
                    type: PROP_TYPE.STRING,
                    description: 'description f',
                },
                g: {
                    type: PROP_TYPE.STRING,
                    description: 'description g',
                },
            },
        });
    }

    return {
        PrivData,
        ReflectData,
        JoinedData,
        ComponentDescription,
        CasingTest,
        AttributeDescription,
        RegularOne,
        RegularTwo,
        NestedComponent,
        NoProps,
    };
}
