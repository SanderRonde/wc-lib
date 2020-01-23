/// <reference types="Cypress" />

interface WaitOptions {
    interval?: number;
    timeout?: number;
    message?: string;
}

declare namespace Cypress {
    interface Chainable {
        shadowGet<K extends keyof HTMLElementTagNameMap>(
            selector: K,
            options?: {
                timeout?: number;
            }
        ): Cypress.Chainable<JQuery<HTMLElementTagNameMap[K]>>;
        shadowGet<K extends keyof ElementTagNameMap>(
            selector: K,
            options?: {
                timeout?: number;
            }
        ): Cypress.Chainable<JQuery<ElementTagNameMap[K]>>;
        shadowGet(
            selector: string,
            options?: {
                timeout?: number;
            }
        ): Cypress.Chainable<JQuery<HTMLElement>>;

        shadowFind<K extends keyof HTMLElementTagNameMap>(
            selector: K,
            options?: {
                timeout?: number;
            }
        ): Cypress.Chainable<JQuery<HTMLElementTagNameMap[K]>>;
        shadowFind<K extends keyof ElementTagNameMap>(
            selector: K,
            options?: {
                timeout?: number;
            }
        ): Cypress.Chainable<JQuery<ElementTagNameMap[K]>>;
        shadowFind(
            selector: string,
            options?: {
                timeout?: number;
            }
        ): Cypress.Chainable<JQuery<HTMLElement>>;

        shadowShould(chainers: string, methodVal: any): Cypress.Chainable<void>;
        shadowShould(
            chainers: string,
            methodVal: string,
            value: any
        ): Cypress.Chainable<void>;
        shadowShould(
            chainers: string,
            methodVal: string | any,
            value?: any
        ): Cypress.Chainable<void>;

        shadowEq(index: number): Cypress.Chainable<JQuery<HTMLElement>>;

        shadowClick(): Cypress.Chainable<JQuery<HTMLElement>>;

        /**
         * Selects given value in an html `select` element
         */
        shadowSelect(
            valueOrText: string
        ): Cypress.Chainable<JQuery<HTMLElement>>;

        shadowTrigger(
            event: string,
            options?: any
        ): Cypress.Chainable<JQuery<HTMLElement>>;

        shadowContains(content: string): Cypress.Chainable<void>;
    }
}
