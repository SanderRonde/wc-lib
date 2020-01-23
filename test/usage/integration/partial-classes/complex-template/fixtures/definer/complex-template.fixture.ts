import { ComplexTemplatingWebComponent } from '../../../../../../../build/es/classes/partial.js';
import { ParentElementFactory } from '../../../../classes/elements/parent-element-factory.js';
import { DefineMetadata } from '../../../../../../../build/es/wc-lib.js';

(window as any).DefineMetadata = DefineMetadata;
ParentElementFactory(ComplexTemplatingWebComponent);
