/**
 * Only the smallest amount of exports you need to
 * build webcomponents with this library. Only
 * really needed if you don't use a tree-shaker
 **/

export { CHANGE_TYPE, PROP_TYPE } from './lib/enums.js';
export { config } from './lib/configurable.js';
import { ConfigurableWebComponent } from './lib/configurable.js';
export { Props, ComplexType } from './lib/props.js';
export { TemplateFn } from './lib/template-fn.js';

export default ConfigurableWebComponent;
