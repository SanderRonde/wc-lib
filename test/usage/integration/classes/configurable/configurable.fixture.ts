import { BasicMixin, SingleMixin, DoubleMixin, MultiMixin, SplitMixin } from "./elements/mixins.js";
import { ConfiguredElement } from "./elements/configured-element.js";
import { ExtendedElement } from "./elements/extended-element.js";

ConfiguredElement.define();
ExtendedElement.define();

BasicMixin.define();
SingleMixin.define();
DoubleMixin.define();
MultiMixin.define();
SplitMixin.define();