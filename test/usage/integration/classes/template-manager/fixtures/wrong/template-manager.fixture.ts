import { ComplexElement, WrongElementListen } from "../../elements/complex-element.js";
import { TestElement } from "../../../elements/test-element.js";

TestElement.define();
(window as any).ComplexElement = ComplexElement;
ComplexElement.define();
WrongElementListen.define();