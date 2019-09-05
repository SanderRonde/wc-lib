import { ConfigurableWebComponent } from "../../../../../../../build/es/wc-lib.js";
import { RootElement } from "../../elements/root-element.js";

RootElement(ConfigurableWebComponent).define(true);

export interface TestGlobalProperties {
	a: string;
	c: string;
}