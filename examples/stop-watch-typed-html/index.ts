import {
    TemplateResult,
    PropertyCommitter,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    isDirective,
    noChange,
} from '../modules/lit-html/lit-html.js';
import { StopWatchTypedHTML } from './stop-watch-typed-html.js';
import { WebComponent } from '../../build/es/wc-lib.js';

WebComponent.initComplexTemplateProvider({
    TemplateResult,
    PropertyCommitter,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    isDirective,
    noChange,
});
StopWatchTypedHTML.define();
