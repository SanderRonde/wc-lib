import { ComplexTemplatingWebComponent } from '../../../../../../../build/es/classes/partial.js';
import { RootElement } from '../../../../classes/hierarchy-manager/elements/root-element.js';

RootElement(ComplexTemplatingWebComponent).define(true);

export interface TestGlobalProperties {
	a: string;
	c: string;
}