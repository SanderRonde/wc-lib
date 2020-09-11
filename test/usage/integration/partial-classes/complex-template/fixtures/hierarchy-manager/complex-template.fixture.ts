import { ComplexTemplatingWebComponent } from '../../../../../../../build/es/classes/partial.js';
import { RootElementFactory } from '../../../../classes/hierarchy-manager/elements/root-element.js';
import { SubtreeFactory } from '../../../../classes/hierarchy-manager/elements/subtree-element.js';

RootElementFactory(ComplexTemplatingWebComponent).define(true);
SubtreeFactory(ComplexTemplatingWebComponent).define(true);

export interface TestGlobalProperties {
    a: string;
    c: string;
}
