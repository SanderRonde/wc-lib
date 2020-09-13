import { ParentElementFactory } from '../../../../classes/elements/parent-element-factory.js';
import { BasicWebComponent } from '../../../../../../../build/es/classes/partial.js';
import { DefineMetadata } from '../../../../../../../build/es/wc-lib.js';

(window as any).DefineMetadata = DefineMetadata;
ParentElementFactory(BasicWebComponent as any);
