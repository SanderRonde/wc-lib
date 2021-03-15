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
} from '../../../../../../../node_modules/lit-html/lit-html.js';
import {
    CustomCSSElement,
    WrongCustomCSSElement,
} from '../../elements/custom-css-element.js';
import { WebComponent } from '../../../../../../../build/es/wc-lib.js';
import { TestElement } from '../../../elements/test-element.js';

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
TestElement.define(true);
CustomCSSElement.define(true);
WrongCustomCSSElement.define(true);
