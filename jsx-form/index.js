import { TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart, AttributeCommitter, NodePart, isDirective, directive, noChange, } from '../../node_modules/lit-html/lit-html.js';
import { WebComponent } from '../../build/es/wc-lib.js';
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
