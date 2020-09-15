import { TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart, AttributeCommitter, NodePart, isDirective, directive, noChange, } from '../../modules/lit-html-bundled/lit-html.js';
import { WebComponent } from '../../modules/wc-lib/wc-lib.js';
import { JsxForm } from './jsx-form.js';
WebComponent.initComplexTemplateProvider({
    TemplateResult,
    PropertyCommitter,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    isDirective,
    directive,
    noChange,
});
JsxForm.define();
