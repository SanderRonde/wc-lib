/// <reference types="Cypress" />

export function expectPrivatePropertyExists(object: any, key: string) {
    expect(object).to.have.property(key).to.not.be.undefined;
}

export function expectPropertyExists<
    O extends {
        [key: string]: any;
    },
    K extends keyof O
>(object: O, key: K) {
    expect(object).to.have.property(key as string).to.not.be.undefined;
}

export function expectMethodExists<
    O extends {
        [key: string]: any;
    },
    K extends keyof O
>(object: O, key: K) {
    expect(object)
        .to.have.property(key as string)
        .to.be.a('function');
}

export function expectPromise(value: Promise<any>) {
    return cy.window().then((window) => {
        assert.instanceOf(value, (window as any).Promise, 'is a promise');
    });
}
