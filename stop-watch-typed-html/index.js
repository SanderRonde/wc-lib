import { TemplateResult, PropertyCommitter, PropertyPart, EventPart, BooleanAttributePart, AttributeCommitter, NodePart, isDirective, directive, noChange, } from '../../node_modules/lit-html/lit-html.js';
import { StopWatchTypedHTML } from './stop-watch-typed-html.js';
import { WebComponent } from '../../build/es/wc-lib.js';
WebComponent.initComplexTemplateProvider({
    TemplateResult,
    PropertyCommitter,
    PropertyPart,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    isDirective,
    directive,
    noChange,
});
StopWatchTypedHTML.define();
