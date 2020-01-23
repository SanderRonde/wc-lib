import { ComplexTemplatingWebComponent } from '../../../../../../../build/es/classes/partial.js';
import { RootElementFactory } from '../../../../classes/hierarchy-manager/elements/root-element.js';

RootElementFactory(ComplexTemplatingWebComponent).define(true);

export interface TestGlobalProperties {
    a: string;
    c: string;
}
