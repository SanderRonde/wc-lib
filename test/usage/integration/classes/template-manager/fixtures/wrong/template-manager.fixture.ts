import { ComplexElement, WrongElementListen } from "../../elements/complex-element.js";
import { TestElement } from "../../../elements/test-element.js";

TestElement.define(true);
(window as any).ComplexElement = ComplexElement;
ComplexElement.define(true);
WrongElementListen.define(true);