/**
 * Only the smallest amount of exports you need to
 * build webcomponents with this library. Only
 * really needed if you don't use a tree-shaker
 **/

export { config } from './lib/configurable.js';
import { ConfigurableWebComponent } from './lib/configurable.js';
export { Props, PROP_TYPE, ComplexType } from './lib/props.js';
export { CHANGE_TYPE, TemplateFn } from './lib/template-fn.js';

export default ConfigurableWebComponent;
