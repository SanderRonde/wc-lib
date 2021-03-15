import {
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
} from '../../../../../../../../node_modules/lit-html/lit-html.js';
import { TestElement } from '../../../../../classes/elements/test-element.js';
import { WebComponent } from '../../../../../../../../build/es/wc-lib.js';

WebComponent.initComplexTemplateProvider({
    TemplateResult,
    PropertyCommitter,
    PropertyPart,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    directive,
    isDirective,
    noChange,
});
TestElement.define(true);
