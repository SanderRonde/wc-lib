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
import { PropsElementFixtureFactory } from '../../elements/props-element.js';

export function propsNoProxyFixtureFactory(
    base: any,
    supportsTemplates: boolean
) {
    if (supportsTemplates) {
        base.initComplexTemplateProvider({
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
    }

    const { ReflectProps, WatchedComponent } = PropsElementFixtureFactory(
        base,
        supportsTemplates
    );
    ReflectProps.define(true);
    WatchedComponent.define(true);
}
