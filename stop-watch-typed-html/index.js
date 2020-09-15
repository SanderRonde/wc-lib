import { TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart, AttributeCommitter, NodePart, isDirective, directive, noChange, } from '../modules/lit-html-bundled/lit-html.js';
import { StopWatchTypedHTML } from './stop-watch-typed-html.js';
import { WebComponent } from '../modules/wc-lib/wc-lib.js';
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
StopWatchTypedHTML.define();
