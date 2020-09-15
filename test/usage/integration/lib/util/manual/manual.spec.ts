import {
    createWatchable,
    watch,
    watchFn,
} from '../../../../../../build/es/wc-lib.js';
import { TemplateClass } from '../../../../../../build/es/lib/template-manager.js';
import { TestElement } from '../../../classes/elements/test-element.js';
import { getFixture } from '../../../../lib/testing';
import { SLOW } from '../../../../lib/timing';
import { Part } from 'lit-html';
import { DeepWatchable } from './elements/deep-watchable.js';
import { ThemedElement } from '../../../classes/theme-manager/elements/themed-element.js';
import { LangElement } from '../../../classes/i18n-manager/elements/test-lang-element.js';
import { JoinedPropsElement } from './elements/joined-props-element.js';

context('Manual rendering', function () {
    this.slow(SLOW);
    before(() => {
        cy.visit(getFixture('lib/util', 'manual', 'standard'));
    });

    context('#createWatchable', () => {
        it('can create watchables', () => {
            const obj = {};
            expect(() => {
                createWatchable(obj, () => {});
            }).to.not.throw;
        });
        it('can add listeners to watchables', () => {
            const key = Math.random() + '';
            const obj = {
                [key]: 1,
            };
            expect(() => {
                const listener = cy.spy((onChange: unknown) => {
                    expect(onChange).to.be.a('function');
                });
                const watched = createWatchable(obj, listener);
                const key = Math.random() + '';

                expect(listener).to.not.be.called;
                watched.__watch(key, () => {});
                expect(listener).to.be.calledOnce;
            }).to.not.throw;
        });
        it('fires listeners on change (without change key)', () => {
            const key = Math.random() + '';
            const obj = {
                [key]: 1,
            };
            expect(() => {
                let _onChange: (value: typeof obj, changedKey?: string) => void;
                const listener = cy.spy(
                    (
                        onChange: (
                            value: typeof obj,
                            changedKey?: string
                        ) => void
                    ) => {
                        _onChange = onChange;
                        expect(onChange).to.be.a('function');
                    }
                );
                const watched = createWatchable(obj, listener);
                const key = Math.random() + '';

                expect(listener).to.not.be.called;
                const changeHandler = cy.spy();
                watched.__watch(key, changeHandler);
                expect(listener).to.be.calledOnce;

                expect(changeHandler).to.not.be.called;
                _onChange!(obj);
                expect(changeHandler).to.be.calledOnceWith(obj[key]);
            }).to.not.throw;
        });
        it('can fire listeners with change key', () => {
            const key = Math.random() + '';
            const obj = {
                [key]: 1,
            };
            expect(() => {
                let _onChange: (value: typeof obj, changedKey?: string) => void;
                const listener = cy.spy(
                    (
                        onChange: (
                            value: typeof obj,
                            changedKey?: string
                        ) => void
                    ) => {
                        _onChange = onChange;
                        expect(onChange).to.be.a('function');
                    }
                );
                const watched = createWatchable(obj, listener);
                const key = Math.random() + '';

                expect(listener).to.not.be.called;
                const changeHandler = cy.spy();
                watched.__watch(key, changeHandler);
                expect(listener).to.be.calledOnce;

                expect(changeHandler).to.not.be.called;
                _onChange!(obj, key);
                expect(changeHandler).to.be.calledOnceWith(obj[key], key);
            }).to.not.throw;
        });
    });
    class DirectiveCapturer {
        private _uncommittedValue: any;
        private _currentValue: any;

        constructor(
            public fn: (...args: any[]) => (part: Part) => void,
            ...args: any[]
        ) {
            fn(...args)({
                commit: () => {
                    this._currentValue = this._uncommittedValue;
                },
                setValue: (value: any) => {
                    this._uncommittedValue = value;
                },
                value: null,
            });
        }

        get currentValue() {
            return this._currentValue;
        }

        get tempValue() {
            return this._uncommittedValue;
        }
    }
    context('#watch', () => {
        it('throws an error if directive is not initialized', () => {
            expect(() => {
                TemplateClass._templateSettings = undefined as any;
                watch(createWatchable({}, () => {}));
            }).to.throw();
        });
        it('returns undefined if ibuiltin methods are accessed', () => {
            TemplateClass._templateSettings = {
                directive: ((fn: any) => (...args: any[]) =>
                    new DirectiveCapturer(fn, ...args)) as any,
            } as any;

            const obj = {
                key1: 0,
                key2: 0,
            };

            let _onChanges: ((
                value: {
                    [x: string]: number;
                },
                changedKey?: string | undefined
            ) => void)[] = [];
            const listener = cy.spy((onChange) => {
                _onChanges.push(onChange);
            });
            const returnValue = watch(createWatchable(obj, listener));

            expect(returnValue.__watch).to.be.undefined;
            expect(returnValue.__original).to.be.undefined;
        });
        it('returns undefined if a nonexistent property is accessed', () => {
            TemplateClass._templateSettings = {
                directive: ((fn: any) => (...args: any[]) =>
                    new DirectiveCapturer(fn, ...args)) as any,
            } as any;

            const obj = {
                key1: 0,
                key2: 0,
            };

            let _onChanges: ((
                value: {
                    [x: string]: number;
                },
                changedKey?: string | undefined
            ) => void)[] = [];
            const listener = cy.spy((onChange) => {
                _onChanges.push(onChange);
            });
            const returnValue = watch(createWatchable(obj, listener));

            expect(returnValue.__nonexistent).to.be.undefined;
        });
        it('can watch any property (with proxy)', () => {
            TemplateClass._templateSettings = {
                directive: ((fn: any) => (...args: any[]) =>
                    new DirectiveCapturer(fn, ...args)) as any,
            } as any;

            const obj = {
                key1: 0,
                key2: 0,
            };

            let _onChanges: ((
                value: {
                    [x: string]: number;
                },
                changedKey?: string | undefined
            ) => void)[] = [];
            const listener = cy.spy((onChange) => {
                _onChanges.push(onChange);
            });
            const returnValue = watch(createWatchable(obj, listener));

            // Initial adding of listeners
            expect(listener).to.not.be.called;
            const key1Directive = (returnValue.key1 as unknown) as DirectiveCapturer;
            expect(listener).to.be.calledOnce;
            const key2Directive = (returnValue.key2 as unknown) as DirectiveCapturer;
            expect(listener).to.be.calledTwice;

            // Check values
            expect(key1Directive.currentValue).to.be.equal(
                obj.key1,
                'initial values are set'
            );
            expect(key2Directive.currentValue).to.be.equal(
                obj.key2,
                'initial values are set'
            );

            // Update values with key
            obj.key1 = 1;
            obj.key2 = 1;
            _onChanges.forEach((f) => f(obj, 'key1'));

            // This updated
            expect(key1Directive.currentValue).to.be.equal(
                obj.key1,
                'key1 was updated'
            );
            // This did not
            expect(key2Directive.currentValue).to.be.equal(0, 'key2 was not');

            // Update values without ke
            obj.key1 = 2;
            obj.key2 = 2;
            _onChanges.forEach((f) => f(obj));

            // They both updated
            expect(key1Directive.currentValue).to.be.equal(
                obj.key1,
                'both values updated'
            );
            expect(key2Directive.currentValue).to.be.equal(
                obj.key2,
                'both values updated'
            );
        });
        context('No Proxy', () => {
            it('can watch any property', () => {
                TemplateClass._templateSettings = {
                    directive: ((fn: any) => (...args: any[]) =>
                        new DirectiveCapturer(fn, ...args)) as any,
                } as any;

                const obj = {
                    key1: 0,
                    key2: 0,
                };

                let _onChanges: ((
                    value: {
                        [x: string]: number;
                    },
                    changedKey?: string | undefined
                ) => void)[] = [];
                const listener = cy.spy((onChange) => {
                    _onChanges.push(onChange);
                });
                const _Proxy = window.Proxy;
                window.Proxy = undefined as any;
                const returnValue = watch(createWatchable(obj, listener));
                window.Proxy = _Proxy;

                // Initial adding of listeners
                expect(listener).to.be.calledTwice;
                const key1Directive = (returnValue.key1 as unknown) as DirectiveCapturer;
                const key2Directive = (returnValue.key2 as unknown) as DirectiveCapturer;
                expect(listener).to.be.calledTwice;

                // Check values
                expect(key1Directive.currentValue).to.be.equal(
                    obj.key1,
                    'initial values are set'
                );
                expect(key2Directive.currentValue).to.be.equal(
                    obj.key2,
                    'initial values are set'
                );

                // Update values with key
                obj.key1 = 1;
                obj.key2 = 1;
                _onChanges.forEach((f) => f(obj, 'key1'));

                // This updated
                expect(key1Directive.currentValue).to.be.equal(
                    obj.key1,
                    'key1 was updated'
                );
                // This did not
                expect(key2Directive.currentValue).to.be.equal(
                    0,
                    'key2 was not'
                );

                // Update values without ke
                obj.key1 = 2;
                obj.key2 = 2;
                _onChanges.forEach((f) => f(obj));

                // They both updated
                expect(key1Directive.currentValue).to.be.equal(
                    obj.key1,
                    'both values updated'
                );
                expect(key2Directive.currentValue).to.be.equal(
                    obj.key2,
                    'both values updated'
                );
            });
            after(() => {
                cy.visit(getFixture('lib/util', 'manual', 'standard'));
                cy.wait(250);
            });
        });
    });
    context('#watchFn', () => {
        it('throws an error if directive is not initialized', () => {
            expect(() => {
                TemplateClass._templateSettings = undefined as any;
                watchFn(createWatchable({}, () => {}));
            }).to.throw();
        });
        it('returns undefined if builtin methods are accessed', () => {
            TemplateClass._templateSettings = {
                directive: ((fn: any) => (...args: any[]) =>
                    new DirectiveCapturer(fn, ...args)) as any,
            } as any;

            const obj = {
                key1: 0,
                key2: 0,
            };

            let _onChanges: ((
                value: {
                    [x: string]: number;
                },
                changedKey?: string | undefined
            ) => void)[] = [];
            const listener = cy.spy((onChange) => {
                _onChanges.push(onChange);
            });
            const returnValue = watchFn(createWatchable(obj, listener));

            expect(returnValue.__watch).to.be.undefined;
            expect(returnValue.__original).to.be.undefined;
        });
        it('returns undefined if a nonexistent property is accessed', () => {
            TemplateClass._templateSettings = {
                directive: ((fn: any) => (...args: any[]) =>
                    new DirectiveCapturer(fn, ...args)) as any,
            } as any;

            const obj = {
                key1: 0,
                key2: 0,
            };

            let _onChanges: ((
                value: {
                    [x: string]: number;
                },
                changedKey?: string | undefined
            ) => void)[] = [];
            const listener = cy.spy((onChange) => {
                _onChanges.push(onChange);
            });
            const returnValue = watchFn(createWatchable(obj, listener));

            expect(returnValue.__nonexistent).to.be.undefined;
        });
        it('can watch any property (with proxy)', () => {
            TemplateClass._templateSettings = {
                directive: ((fn: any) => (...args: any[]) =>
                    new DirectiveCapturer(fn, ...args)) as any,
            } as any;

            const obj = {
                key1: 0,
                key2: 0,
            };

            let _onChanges: ((
                value: {
                    [x: string]: number;
                },
                changedKey?: string | undefined
            ) => void)[] = [];
            const listener = cy.spy((onChange) => {
                _onChanges.push(onChange);
            });
            const returnValue = watchFn(createWatchable(obj, listener));

            // Initial adding of listeners
            expect(listener).to.not.be.called;
            const key1Directive = (returnValue.key1((value) => {
                return value + 10;
            }) as unknown) as DirectiveCapturer;
            expect(listener).to.be.calledOnce;
            const placeholder = Math.random() + '';
            let _resolve: (value: number) => void;
            const key2Directive = (returnValue.key2(() => {
                return new Promise((resolve) => {
                    _resolve = (v) => {
                        resolve(v);
                    };
                });
            }, placeholder) as unknown) as DirectiveCapturer;
            expect(listener).to.be.calledTwice;

            // Check values
            expect(key1Directive.currentValue).to.be.equal(
                obj.key1 + 10,
                'initial values are set'
            );
            expect(key2Directive.tempValue).to.be.equal(
                placeholder,
                'placeholder is set'
            );

            // Resolve promise
            _resolve!(123);
            cy.wait(100).then(() => {
                expect(key2Directive.currentValue).to.be.equal(
                    123,
                    'promise has been resolved'
                );

                // Update values with key
                obj.key1 = 1;
                obj.key2 = 1;
                _onChanges.forEach((f) => f(obj, 'key1'));

                // This updated
                expect(key1Directive.currentValue).to.be.equal(
                    obj.key1 + 10,
                    'key1 changed'
                );
                // This did not
                expect(key2Directive.currentValue).to.be.equal(
                    123,
                    'key2 did not'
                );

                // Update values without key
                obj.key1 = 2;
                obj.key2 = 2;
                _onChanges.forEach((f) => f(obj));

                // The first one updated
                expect(key1Directive.currentValue).to.be.equal(
                    obj.key1 + 10,
                    'key1 changed'
                );
                // The second one is still waiting
                expect(key2Directive.currentValue).to.be.equal(
                    123,
                    'key2 is still waiting for the promise'
                );

                _resolve!(246);
                cy.wait(100).then(() => {
                    // The second one has been resolved
                    expect(key2Directive.currentValue).to.be.equal(
                        246,
                        'key2 updated'
                    );
                });
            });
        });
        context('No Proxy', () => {
            beforeEach(() => {
                cy.visit(getFixture('lib/util', 'manual', 'standard'), {
                    onBeforeLoad(win) {
                        delete (win as any).Proxy;
                    },
                });
                cy.wait(250);
            });
            it('can watch any property', () => {
                TemplateClass._templateSettings = {
                    directive: ((fn: any) => (...args: any[]) =>
                        new DirectiveCapturer(fn, ...args)) as any,
                } as any;

                const obj = {
                    key1: 0,
                    key2: 0,
                };

                let _onChanges: ((
                    value: {
                        [x: string]: number;
                    },
                    changedKey?: string | undefined
                ) => void)[] = [];
                const listener = cy.spy((onChange) => {
                    _onChanges.push(onChange);
                });

                const _Proxy = window.Proxy;
                window.Proxy = undefined as any;
                const returnValue = watchFn(createWatchable(obj, listener));
                window.Proxy = _Proxy;

                // Initial adding of listeners
                expect(listener).to.not.be.called;
                const key1Directive = (returnValue.key1((value) => {
                    return value + 10;
                }) as unknown) as DirectiveCapturer;
                expect(listener).to.be.calledOnce;
                const placeholder = Math.random() + '';
                let _resolve: (value: number) => void;
                const key2Directive = (returnValue.key2(() => {
                    return new Promise((resolve) => {
                        _resolve = (v) => {
                            resolve(v);
                        };
                    });
                }, placeholder) as unknown) as DirectiveCapturer;
                expect(listener).to.be.calledTwice;

                // Check values
                expect(key1Directive.currentValue).to.be.equal(
                    obj.key1 + 10,
                    'initial values are set'
                );
                expect(key2Directive.tempValue).to.be.equal(
                    placeholder,
                    'placeholder is set'
                );

                // Resolve promise
                _resolve!(123);
                cy.wait(100).then(() => {
                    expect(key2Directive.currentValue).to.be.equal(
                        123,
                        'promise has been resolved'
                    );

                    // Update values with key
                    obj.key1 = 1;
                    obj.key2 = 1;
                    _onChanges.forEach((f) => f(obj, 'key1'));

                    // This updated
                    expect(key1Directive.currentValue).to.be.equal(
                        obj.key1 + 10,
                        'key1 changed'
                    );
                    // This did not
                    expect(key2Directive.currentValue).to.be.equal(
                        123,
                        'key2 did not'
                    );

                    // Update values without ke
                    obj.key1 = 2;
                    obj.key2 = 2;
                    _onChanges.forEach((f) => f(obj));

                    // The first one updated
                    expect(key1Directive.currentValue).to.be.equal(
                        obj.key1 + 10,
                        'key1 changed'
                    );
                    // The second one is still waiting
                    expect(key2Directive.currentValue).to.be.equal(
                        123,
                        'key2 is still waiting for the promise'
                    );

                    _resolve!(246);
                    cy.wait(100).then(() => {
                        // The second one has been resolved
                        expect(key2Directive.currentValue).to.be.equal(
                            246,
                            'key2 updated'
                        );
                    });
                });
            });
            after(() => {
                cy.visit(getFixture('lib/util', 'manual', 'standard'));
                cy.wait(250);
            });
        });
    });
    const directiveFn = ((fn: any) => (...args: any[]) =>
        new DirectiveCapturer(fn, ...args)) as any;
    context('Props', () => {
        before(() => {
            TemplateClass._templateSettings = {
                directive: directiveFn,
            } as any;
        });
        it('can watch props', () => {
            cy.get('#test').then(([testElement]: JQuery<TestElement>) => {
                expect(() => {
                    const prop = (watch(testElement.getRenderArgs(0).props)
                        .x as unknown) as DirectiveCapturer;
                    expect(prop.currentValue).to.be.equal(testElement.props.x);
                }).to.not.throw;
            });
        });
        it('updates when a property is updated', () => {
            cy.get('#test').then(([testElement]: JQuery<TestElement>) => {
                const prop = (watch(testElement.getRenderArgs(0).props)
                    .x as unknown) as DirectiveCapturer;
                expect(prop.currentValue).to.be.equal(testElement.props.x);

                testElement.props.x = 10;
                expect(prop.currentValue).to.be.equal(testElement.props.x);
            });
        });
        it('updates when a property is deeply updated (through watching)', () => {
            cy.get('#deep').then(([deepWatchable]: JQuery<DeepWatchable>) => {
                const prop = (watchFn(deepWatchable.getRenderArgs(0).props).y(
                    (val) => val.property
                ) as unknown) as DirectiveCapturer;
                expect(prop.currentValue).to.be.equal(
                    deepWatchable.props.y.property
                );

                deepWatchable.props.y.property = 20;
                cy.wait(10).then(() => {
                    expect(prop.currentValue).to.be.equal(
                        deepWatchable.props.y.property
                    );
                });
            });
        });
    });
    context('Joined props', () => {
        before(() => {
            TemplateClass._templateSettings = {
                directive: directiveFn,
            } as any;
        });
        it('can watch props', () => {
            cy.get('#joined').then(
                ([testElement]: JQuery<JoinedPropsElement>) => {
                    expect(() => {
                        {
                            const prop = (watch(
                                testElement.getRenderArgs(0).props
                            ).x as unknown) as DirectiveCapturer;
                            expect(prop.currentValue).to.be.equal(
                                testElement.props.x
                            );
                        }
                        {
                            const prop = (watch(
                                testElement.getRenderArgs(0).props
                            ).y as unknown) as DirectiveCapturer;
                            expect(prop.currentValue).to.be.equal(
                                testElement.props.y
                            );
                        }
                    }).to.not.throw;
                }
            );
        });
        it('updates when a property is updated', () => {
            cy.get('#joined').then(
                ([testElement]: JQuery<JoinedPropsElement>) => {
                    {
                        const prop = (watch(testElement.getRenderArgs(0).props)
                            .x as unknown) as DirectiveCapturer;
                        expect(prop.currentValue).to.be.equal(
                            testElement.props.x
                        );

                        testElement.props.x = 10;
                        expect(prop.currentValue).to.be.equal(
                            testElement.props.x
                        );
                    }

                    {
                        const prop = (watch(testElement.getRenderArgs(0).props)
                            .y as unknown) as DirectiveCapturer;
                        expect(prop.currentValue).to.be.equal(
                            testElement.props.y
                        );

                        testElement.props.y = 10;
                        expect(prop.currentValue).to.be.equal(
                            testElement.props.y
                        );
                    }
                }
            );
        });
    });
    context('Theme', () => {
        it('can watch theme', () => {
            cy.get('#themed').then(([themedElement]: JQuery<ThemedElement>) => {
                expect(() => {
                    const theme = (watch(themedElement.getRenderArgs(0).theme)
                        .color1 as unknown) as DirectiveCapturer;
                    expect(theme.currentValue).to.be.equal(
                        themedElement.getTheme().color1
                    );
                }).to.not.throw;
            });
        });
        it('updates when the theme is changed', () => {
            cy.get('#themed').then(([themedElement]: JQuery<ThemedElement>) => {
                const theme = (watch(themedElement.getRenderArgs(0).theme)
                    .color1 as unknown) as DirectiveCapturer;
                expect(theme.currentValue).to.be.equal(
                    themedElement.getTheme().color1
                );

                themedElement.setTheme('second');
                expect(theme.currentValue).to.be.equal(
                    themedElement.getTheme().color1
                );
            });
        });
    });
    context('I18N', () => {
        it('can watch language', () => {
            cy.get('#lang').then(([langElement]: JQuery<LangElement>) => {
                expect(() => {
                    const value = (langElement.__(
                        'test'
                    ) as unknown) as DirectiveCapturer;

                    expect(value.tempValue).to.be.equal('test');
                }).to.not.throw;
            });
        });
        it('updates when the language is changed', () => {
            cy.get('#lang').then(([langElement]: JQuery<LangElement>) => {
                const value = (langElement.__(
                    'test'
                ) as unknown) as DirectiveCapturer;

                expect(value.tempValue).to.be.equal('{{test}}');
                cy.wait(100).then(() => {
                    expect(value.tempValue).to.be.equal('test');

                    langElement.setLang('nl');
                    cy.wait(100).then(() => {
                        expect(value.currentValue).to.be.equal('test2');
                    });
                });
            });
        });
    });
    context('Global props', () => {
        it('can watch global props', () => {
            cy.get('#test').then(([testElement]: JQuery<TestElement>) => {
                expect(() => {
                    testElement.globalProps().set('a', Math.random() + '');
                    const prop = (watch(
                        testElement.getRenderArgs(0).globalProps
                    ).a as unknown) as DirectiveCapturer;
                    expect(prop.currentValue).to.be.equal(
                        testElement.globalProps().get('a')
                    );
                }).to.not.throw;
            });
        });
        it('updates when global props are changed', () => {
            cy.get('#test').then(([testElement]: JQuery<TestElement>) => {
                testElement.globalProps().set('a', Math.random() + '');
                const prop = (watch(testElement.getRenderArgs(0).globalProps)
                    .a as unknown) as DirectiveCapturer;
                expect(prop.currentValue).to.be.equal(
                    testElement.globalProps().get('a')
                );

                testElement.globalProps().set('a', Math.random() + '');
                expect(prop.currentValue).to.be.equal(
                    testElement.globalProps().get('a')
                );
            });
        });
    });
    context('Subtree props', () => {
        beforeEach(() => {
            cy.visit(getFixture('lib/util', 'manual', 'standard'));
        });
        it('can watch subtree props', () => {
            cy.get('#test').then(([testElement]: JQuery<TestElement>) => {
                expect(() => {
                    testElement.registerAsSubTreeRoot();
                    testElement.setSubTreeProps({
                        a: Math.random() + '',
                    });
                    const prop = (watch(
                        testElement.getRenderArgs(0).subtreeProps as any
                    ).a as unknown) as DirectiveCapturer;
                    expect(prop.currentValue).to.be.equal(
                        testElement.getSubTreeProps().a
                    );
                }).to.not.throw;
            });
        });
        it('updates when subtree props are changed', () => {
            cy.get('#test').then(([testElement]: JQuery<TestElement>) => {
                testElement.registerAsSubTreeRoot();
                testElement.setSubTreeProps({
                    a: Math.random() + '',
                });
                const prop = (watch(
                    testElement.getRenderArgs(0).subtreeProps as any
                ).a as unknown) as DirectiveCapturer;
                expect(prop.currentValue).to.be.equal(
                    testElement.getSubTreeProps().a
                );

                testElement.setSubTreeProps({
                    a: Math.random() + '',
                });
                expect(prop.currentValue).to.be.equal(
                    testElement.getSubTreeProps().a
                );
            });
        });
    });
});
