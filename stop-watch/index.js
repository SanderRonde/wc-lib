import { WebComponent } from "../modules/wc-lib/wc-lib.js";
import { StopWatch } from "./stop-watch.js";
// Do this once for every website/webpage that uses complex templates.
import { TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart, AttributeCommitter, NodePart, isDirective, noChange } from "../modules/lit-html/lit-html.js";
WebComponent.initComplexTemplateProvider({
    TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart,
    AttributeCommitter, NodePart, isDirective, noChange
});
StopWatch.define();
