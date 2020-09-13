import { ComplexTemplatingWebComponent } from '../../../../../../../build/es/classes/partial.js';
import { RootElementFactory } from '../../../../classes/hierarchy-manager/elements/root-element.js';
import { SubtreeFactory } from '../../../../classes/hierarchy-manager/elements/subtree-element.js';

RootElementFactory(ComplexTemplatingWebComponent as any).define(true);
SubtreeFactory(ComplexTemplatingWebComponent as any).define(true);

export interface TestGlobalProperties {
    a: string;
    c: string;
}
