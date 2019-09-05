import { TestElementFactory } from "../../../elements/test-element-factory.js";
import { LifecycleElement } from "../../elements/lifecycle-element.js";

export function componentFixtureFactory(base: any) {
	TestElementFactory(base).define(true);
	LifecycleElement(base).define(true);
}