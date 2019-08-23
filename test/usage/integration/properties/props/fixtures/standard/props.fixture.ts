import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../../../node_modules/lit-html/lit-html.js";
import { PropsElement, EmptyProps, PrivProps, ReflectProps, MergedProps, UnmergedProps, InvalidDefineArg, OverriddenProp, NoReflectSelf } from '../../elements/props-element.js';
import { WebComponent } from '../../../../../../../build/es/wc-lib.js';


WebComponent.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});

PropsElement.define(true);
EmptyProps.define(true);
PrivProps.define(true);
ReflectProps.define(true);
MergedProps.define(true);
UnmergedProps.define(true);
InvalidDefineArg.define(true);
OverriddenProp.define(true);
NoReflectSelf.define(true);