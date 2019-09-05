import { TestElementFactory } from "../../../elements/test-element-factory.js";
import { LifecycleElementFactory } from "../../elements/lifecycle-element.js";

export function componentFixtureFactory(base: any) {
	TestElementFactory(base).define(true);
	LifecycleElementFactory(base).define(true);
}