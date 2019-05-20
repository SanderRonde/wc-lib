/// <reference types="Cypress" />

export function assertPrivatePropertyExists(object: any, key: string) {
	assert.property(object, key as string, `has a ${key} property`);
	assert.isDefined(object[key], `${key} is defined`);
}

export function assertPropertyExists<O extends {
	[key: string]: any;
}, K extends keyof O>(object: O, key: K) {
	assert.property(object, key as string, `has a ${key} property`);
	assert.isDefined(object[key], `${key} is defined`);
}

export function assertMethodExists<O extends {
	[key: string]: any;
}, K extends keyof O>(object: O, key: K) {
	assertPropertyExists(object, key);
	assert.isFunction(object[key], `${key} is a function`);
}

