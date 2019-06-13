import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../../../node_modules/lit-html/lit-html.js";
import { PropsElement, EmptyProps, PrivProps, ReflectProps, MergedProps, UnmergedProps, InvalidDefineArg, OverriddenProp, NoReflectSelf } from '../../elements/props-element.js';
import { WebComponentTemplateManager } from '../../../../../../../src/wclib.js';


WebComponentTemplateManager.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});

PropsElement.define();
EmptyProps.define();
PrivProps.define();
ReflectProps.define();
MergedProps.define();
UnmergedProps.define();
InvalidDefineArg.define();
OverriddenProp.define();
NoReflectSelf.define();