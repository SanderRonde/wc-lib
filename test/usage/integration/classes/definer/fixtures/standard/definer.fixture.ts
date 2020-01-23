import {
    DefineMetadata,
    ConfigurableWebComponent,
} from '../../../../../../../build/es/wc-lib.js';
import { ParentElementFactory } from '../../../elements/parent-element-factory.js';

(window as any).DefineMetadata = DefineMetadata;
ParentElementFactory(ConfigurableWebComponent);
