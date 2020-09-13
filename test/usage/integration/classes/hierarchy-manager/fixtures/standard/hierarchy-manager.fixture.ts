import { ConfigurableWebComponent } from '../../../../../../../build/es/wc-lib.js';
import { RootElementFactory } from '../../elements/root-element.js';
import { SubtreeFactory } from '../../elements/subtree-element.js';

RootElementFactory(ConfigurableWebComponent as any).define(true);
SubtreeFactory(ConfigurableWebComponent as any).define(true);

export interface TestGlobalProperties {
    a: string;
    c: string;
}
