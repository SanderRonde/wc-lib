import { ConfigurableWebComponent } from '../../../../../build/es/wc-lib.js';
import { expectMethodExists } from '../../../lib/assertions';
import { ParentElement } from '../elements/parent-element';
import { TestElement } from '../elements/test-element';
import { RootElement } from './elements/root-element';
import { SLOW } from '../../../lib/timing.js';
import { SubtreeElement } from './elements/subtree-element.js';
function getAllElements() {
    return cy
        .get('root-element')
        .shadowFind('parent-element')
        .then((parents: JQuery<ParentElement>) => {
            return cy
                .get('root-element')
                .shadowFind('test-element')
                .then((shallowTests: JQuery<TestElement>) => {
                    return cy
                        .get('root-element')
                        .shadowFind('parent-element')
                        .shadowFind('test-element')
                        .then((deepTests: JQuery<TestElement>) => {
                            return cy
                                .get('root-element')
                                .then(([root]: JQuery<RootElement>) => {
                                    const elements = [
                                        root,
                                        ...parents,
                                        ...shallowTests,
                                        ...deepTests,
                                    ];
                                    return elements;
                                });
                        });
                });
        });
}
function assertDefaultProps(
    element: RootElement | TestElement | ParentElement
) {
    const props = element.globalProps();
    expect(props.all).to.be.deep.equal(
        {
            a: 'b',
            c: 'd',
        },
        'global properties are set'
    );
    expect(props.get('a')).to.be.equal('b', 'prop is set');
    expect(props.get('c')).to.be.equal('d', 'prop is set');
}
export function hierarchyManagerspec(fixture: string) {
    context('Hierarchy-Manager', function() {
        this.slow(SLOW);
        before(() => {
            cy.visit(fixture);
        });
        context('Properties/Methods', () => {
            it('exposes a #registerChild method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'registerChild');
                });
            });
            it('exposes a #globalProps method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'globalProps');
                });
            });
            it('exposes a #getRoot method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'getRoot');
                });
            });
            it('exposes a #runGlobalFunction method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'runGlobalFunction');
                });
            });
            it('exposes a #listenGP method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'listenGP');
                });
            });
            it('exposes a #registerAsSubTreeRoot method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'registerAsSubTreeRoot');
                });
            });
            it('exposes a #setSubTreeProps method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'setSubTreeProps');
                });
            });
            it('exposes a #getSubtreeRoots method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'getSubtreeRoots');
                });
            });
            it('exposes a #getSubTreeProps method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'getSubTreeProps');
                });
            });
        });
        context('Hierarchy', () => {
            it('determines root-element as the root', () => {
                cy.get('root-element').then(([el]: JQuery<RootElement>) => {
                    expect(el.getRoot()).to.be.equal(
                        el,
                        'root-element is the root'
                    );
                });
            });
            it('returns root-element as the root of other elements', () => {
                getAllElements().then((elements) => {
                    cy.get('root-element').then(
                        ([root]: JQuery<RootElement>) => {
                            for (const el of elements) {
                                expect((el as any).getRoot()).to.be.equal(
                                    root,
                                    'root-element is the root'
                                );
                            }
                        }
                    );
                });
            });
        });
        context('Subtrees', () => {
            beforeEach(() => {
                cy.reload(true);
            });
            it('can define a node as a subtree element', () => {
                cy.get('#subtree-A').then(
                    ([subTreeRoot]: JQuery<SubtreeElement>) => {
                        expect(() => {
                            subTreeRoot.register();
                        }).to.not.throw;
                    }
                );
            });
            it('throws an error when updating an unregistered element', () => {
                cy.get('#subtree-A').then(
                    ([subTreeRoot]: JQuery<SubtreeElement>) => {
                        expect(() => {
                            subTreeRoot.updateSubtree();
                        }).to.throw();
                    }
                );
            });
            it('initially returns an "empty" subtree', () => {
                cy.get('.tests').then((testElements: JQuery<TestElement>) => {
                    for (const testElement of testElements) {
                        expect(testElement.getSubTreeProps()).to.be.deep.equal(
                            {}
                        );
                    }

                    cy.get('.subtrees').then(
                        (subtreeRoots: JQuery<SubtreeElement>) => {
                            [...subtreeRoots].forEach((root) => {
                                root.register();
                            });

                            for (const testElement of testElements) {
                                expect(
                                    testElement.getSubTreeProps()
                                ).to.be.deep.equal({
                                    x: 0,
                                    y: 0,
                                });
                            }
                        }
                    );
                });
            });
            it('can be registered without any props', () => {
                cy.get('.tests').then((testElements: JQuery<TestElement>) => {
                    for (const testElement of testElements) {
                        expect(testElement.getSubTreeProps()).to.be.deep.equal(
                            {}
                        );
                    }

                    cy.get('.subtrees').then(
                        (subtreeRoots: JQuery<SubtreeElement>) => {
                            [...subtreeRoots].forEach((root) => {
                                root.registerEmpty();
                            });

                            for (const testElement of testElements) {
                                expect(
                                    testElement.getSubTreeProps()
                                ).to.be.deep.equal({});
                            }
                        }
                    );
                });
            });
            it('returns joined root when registered', () => {
                cy.get('.tests').then((testElements: JQuery<TestElement>) => {
                    for (const testElement of testElements) {
                        expect(testElement.getSubTreeProps()).to.be.deep.equal(
                            {}
                        );
                    }

                    cy.get('.subtrees').then(
                        (subtreeRoots: JQuery<SubtreeElement>) => {
                            [...subtreeRoots].forEach((root) => {
                                root.register();
                                root.updateSubtree();
                            });

                            cy.get('#test-AB').then(
                                ([testElement]: JQuery<TestElement>) => {
                                    expect(
                                        testElement.getSubTreeProps()
                                    ).to.be.deep.equal({
                                        x: 5,
                                        y: 6,
                                    });
                                }
                            );
                        }
                    );
                });
            });
            it('roots are scoped', () => {
                cy.get('.tests').then((testElements: JQuery<TestElement>) => {
                    for (const testElement of testElements) {
                        expect(testElement.getSubTreeProps()).to.be.deep.equal(
                            {}
                        );
                    }

                    cy.get('.subtrees').then(
                        (subtreeRoots: JQuery<SubtreeElement>) => {
                            [...subtreeRoots].forEach((root) => {
                                root.register();
                                root.updateSubtree();
                            });

                            cy.get('#test-AB').then(
                                ([testElement]: JQuery<TestElement>) => {
                                    expect(
                                        testElement.getSubTreeProps()
                                    ).to.be.deep.equal({
                                        x: 5,
                                        y: 6,
                                    });
                                }
                            );
                            cy.get('#test-A').then(
                                ([testElement]: JQuery<TestElement>) => {
                                    expect(
                                        testElement.getSubTreeProps()
                                    ).to.be.deep.equal({
                                        x: 1,
                                        y: 1,
                                    });
                                }
                            );
                        }
                    );
                });
            });
            it('roots can be changed', () => {
                cy.get('.subtrees').then(
                    (subtreeRoots: JQuery<SubtreeElement>) => {
                        [...subtreeRoots].forEach((root) => {
                            root.register();
                            root.updateSubtree();
                        });

                        cy.get('#test-A').then(
                            ([testElement]: JQuery<TestElement>) => {
                                expect(
                                    testElement.getSubTreeProps()
                                ).to.be.deep.equal({
                                    x: 1,
                                    y: 1,
                                });

                                [...subtreeRoots].forEach((root) => {
                                    root.props.x = 10;
                                    root.props.y = 11;

                                    root.register();
                                    root.updateSubtree();
                                });

                                expect(
                                    testElement.getSubTreeProps()
                                ).to.be.deep.equal({
                                    x: 10,
                                    y: 11,
                                });
                            }
                        );
                    }
                );
            });
            it('all parent roots can be fetched', () => {
                cy.get('.subtrees').then(
                    (subtreeRoots: JQuery<SubtreeElement>) => {
                        [...subtreeRoots].forEach((root) => {
                            root.register();
                        });

                        cy.get('#subtree-A').then(
                            ([rootA]: JQuery<SubtreeElement>) => {
                                cy.get('#subtree-B').then(
                                    ([rootB]: JQuery<SubtreeElement>) => {
                                        cy.get('#test-A').then(
                                            ([testElement]: JQuery<
                                                TestElement
                                            >) => {
                                                const roots = testElement.getSubtreeRoots();
                                                expect(roots).to.have.length(1);
                                                expect(roots).to.include(rootA);
                                            }
                                        );

                                        cy.get('#test-AB').then(
                                            ([testElement]: JQuery<
                                                TestElement
                                            >) => {
                                                const roots = testElement.getSubtreeRoots();
                                                expect(roots).to.have.length(2);
                                                expect(roots).to.include(rootA);
                                                expect(roots).to.include(rootB);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            });
            it('calls subtree props changed when props are changed', () => {
                cy.get('#subtree-A').then(
                    ([subtreeRoot]: JQuery<SubtreeElement>) => {
                        expect(subtreeRoot.renders).to.be.equal(1);

                        subtreeRoot.register();

                        expect(subtreeRoot.renders).to.be.equal(2);

                        subtreeRoot.updateSubtree();

                        expect(subtreeRoot.renders).to.be.equal(3);
                    }
                );
            });
        });
        context('Global Properties', () => {
            afterEach(() => {
                cy.get('root-element').then(([root]: JQuery<RootElement>) => {
                    const props = root.globalProps();
                    props.set('a', 'b');
                    props.set('c', 'd');
                });
            });
            it('root node contains global properties', () => {
                cy.get('root-element').then(([root]: JQuery<RootElement>) => {
                    assertDefaultProps(root);
                });
            });
            it('child nodes contain global properties', () => {
                getAllElements().then((elements) => {
                    for (const el of elements) {
                        assertDefaultProps(el);
                    }
                });
            });
            it('allows setting of global props', () => {
                cy.get('root-element').then(([root]: JQuery<RootElement>) => {
                    const props = root.globalProps();
                    assertDefaultProps(root);
                    props.set('a', 'e');
                    expect(props.get('a')).to.be.equal('e', 'prop was changed');
                    props.set('a', 'b');
                    expect(props.get('a')).to.be.equal('b', 'prop was changed');
                });
            });
            it('propagates prop changes to children', () => {
                getAllElements().then((elements) => {
                    cy.get('root-element').then(
                        ([root]: JQuery<RootElement>) => {
                            const props = root.globalProps();
                            assertDefaultProps(root);
                            props.set('a', 'e');
                            for (const element of elements) {
                                expect(
                                    element.globalProps().get('a')
                                ).to.be.equal('e', 'prop was changed');
                            }
                            props.set('a', 'b');
                            for (const element of elements) {
                                expect(
                                    element.globalProps().get('a')
                                ).to.be.equal('b', 'prop was changed');
                            }
                        }
                    );
                });
            });
            it('allows children to change properties as well', () => {
                getAllElements().then((elements) => {
                    cy.get('root-element').then(
                        ([root]: JQuery<RootElement>) => {
                            const props = root.globalProps();
                            assertDefaultProps(root);
                            for (let i = 0; i < elements.length; i++) {
                                const props = elements[i].globalProps();
                                props.set('a', i + '');
                                for (const element of elements) {
                                    expect(
                                        element.globalProps().get('a')
                                    ).to.be.equal(i + '', 'prop was changed');
                                }
                            }
                            props.set('a', 'b');
                            for (const element of elements) {
                                expect(
                                    element.globalProps().get('a')
                                ).to.be.equal('b', 'prop was changed back');
                            }
                        }
                    );
                });
            });
            context('Rendering', () => {
                beforeEach(() => {
                    cy.reload(true);
                });
                it('calls render with CHANGE_TYPE.GLOBAL_PROPS when global props change', () => {
                    cy.get('root-element').then(
                        ([root]: JQuery<RootElement>) => {
                            expect(root.renders).to.be.equal(1);

                            root.globalProps().set('a', '10');

                            expect(root.renders).to.be.equal(2);
                        }
                    );
                });
            });
            context('Listening', () => {
                it('allows for listening for global property changes', () => {
                    cy.get('root-element').then(
                        ([root]: JQuery<RootElement>) => {
                            expect(() => {
                                root.listenGP('globalPropChange', () => {});
                            }, 'listening does not throw').to.not.throw;
                        }
                    );
                });
                it('fires the listener when a property is changed', () => {
                    cy.get('root-element').then(
                        ([root]: JQuery<RootElement>) => {
                            const listener = cy.spy() as any;
                            root.listenGP('globalPropChange', listener);
                            root.globalProps().set('a', 'e');
                            expect(listener).to.be.calledOnce;
                            root.globalProps().set('a', 'b');
                            expect(listener).to.be.calledTwice;
                        }
                    );
                });
                it('only fires the listener once if once is set to true', () => {
                    cy.get('root-element').then(
                        ([root]: JQuery<RootElement>) => {
                            const listener = cy.spy() as any;
                            root.listenGP('globalPropChange', listener, true);
                            root.globalProps().set('a', 'e');
                            expect(listener).to.be.calledOnce;
                            root.globalProps().set('a', 'b');
                            expect(listener).to.be.calledOnce;
                        }
                    );
                });
                it('passes the changed key and its values', () => {
                    cy.get('root-element').then(
                        ([root]: JQuery<RootElement>) => {
                            let fired: number = 0;
                            const listener = cy.spy((key, newVal, oldVal) => {
                                fired++;
                                if (fired > 1) return;
                                expect(key).to.be.equal('a', 'key is a');
                                expect(newVal).to.be.equal(
                                    'e',
                                    'value was changed to e'
                                );
                                expect(oldVal).to.be.equal(
                                    'b',
                                    'old value was b'
                                );
                            });
                            root.listenGP('globalPropChange', listener as any);
                            root.globalProps().set('a', 'e');
                            expect(listener).to.be.calledOnce;
                        }
                    );
                });
            });
        });
        context('Global function', () => {
            it('can make a function propagate to all components', () => {
                getAllElements().then((elements) => {
                    cy.get('root-element').then(
                        ([root]: JQuery<RootElement>) => {
                            const callMap: WeakSet<ConfigurableWebComponent<
                                any
                            >> = new WeakSet();
                            root.runGlobalFunction<
                                ConfigurableWebComponent<any>
                            >((el) => {
                                callMap.add(el);
                            });
                            for (const element of elements) {
                                expect(
                                    callMap.has(element),
                                    'function was called on element'
                                ).to.be.true;
                            }
                        }
                    );
                });
            });
            it('returns an array containing the return values', () => {
                getAllElements().then((elements) => {
                    cy.get('root-element').then(
                        ([root]: JQuery<RootElement>) => {
                            const callMap: Map<
                                ConfigurableWebComponent<any>,
                                number
                            > = new Map();
                            const returnVal = root.runGlobalFunction<
                                ConfigurableWebComponent<any>
                            >((el) => {
                                const num = Math.random();
                                callMap.set(el, num);
                                return num;
                            });
                            for (const element of elements) {
                                expect(
                                    callMap.has(element),
                                    'function was called on element'
                                ).to.be.true;
                            }
                            expect(returnVal).to.have.same.members(
                                [...callMap.values()],
                                'return value contains all returned values'
                            );
                        }
                    );
                });
            });
        });
    });
}
