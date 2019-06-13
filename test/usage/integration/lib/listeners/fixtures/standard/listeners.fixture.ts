import { TestElement } from "../../../../classes/elements/test-element.js";
import { Listeners } from "../../../../../../../src/wclib.js";

export interface ListenerWindow extends Window {
	Listeners: typeof Listeners
}
declare const window: ListenerWindow;

TestElement.define();
window.Listeners = Listeners; 