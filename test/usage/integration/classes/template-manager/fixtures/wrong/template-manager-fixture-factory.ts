import { complexElementFactory } from "../../elements/complex-element.js";
import { TestElementFactory } from "../../../elements/test-element-factory.js";

export function templateManagerWrongFixtureFactory(base: any) {
	TestElementFactory(base).define(true);

	const { ComplexElement, WrongElementListen } = complexElementFactory(base);
	(window as any).ComplexElement = ComplexElement;
	ComplexElement.define(true);
	WrongElementListen.define(true);
}