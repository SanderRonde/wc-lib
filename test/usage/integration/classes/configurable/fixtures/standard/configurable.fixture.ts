import {
    BasicMixin,
    SingleMixin,
    DoubleMixin,
    MultiMixin,
    SplitMixin,
    ManualMixin,
} from '../../elements/mixins.js';
import { ConfiguredElement } from '../../elements/configured-element.js';
import { ExtendedElement } from '../../elements/extended-element.js';

ConfiguredElement.define(true);
ExtendedElement.define(true);

BasicMixin.define(true);
SingleMixin.define(true);
DoubleMixin.define(true);
MultiMixin.define(true);
SplitMixin.define(true);
ManualMixin.define(true);
