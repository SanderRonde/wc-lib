import { WebComponent } from "../../src/wclib";
import { StopWatch } from "./stop-watch";

// Do this once for every website/webpage that uses complex templates.
import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "lit-html";
WebComponent.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});


StopWatch.define();