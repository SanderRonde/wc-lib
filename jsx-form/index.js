import { TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart, AttributeCommitter, NodePart, isDirective, noChange } from "../modules/lit-html/lit-html.js";
import { WebComponent } from "../modules/wc-lib/wc-lib.js";
import { JsxForm } from "./jsx-form.js";
WebComponent.initComplexTemplateProvider({
    TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart,
    AttributeCommitter, NodePart, isDirective, noChange
});
JsxForm.define();
