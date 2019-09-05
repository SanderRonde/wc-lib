import { ConfigurableWebComponent } from "../../../../../../../build/es/wc-lib.js";
import { RootElementFactory } from "../../elements/root-element.js";

RootElementFactory(ConfigurableWebComponent).define(true);

export interface TestGlobalProperties {
	a: string;
	c: string;
}