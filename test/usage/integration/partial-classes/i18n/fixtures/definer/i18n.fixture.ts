import { ParentElementFactory } from '../../../../classes/elements/parent-element-factory.js';
import { I18NWebComponent } from '../../../../../../../build/es/classes/partial.js';
import { DefineMetadata } from '../../../../../../../build/es/wc-lib.js';

(window as any).DefineMetadata = DefineMetadata;
ParentElementFactory(I18NWebComponent as any);
