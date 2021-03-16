import {
    TemplateResult,
    PropertyCommitter,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    isDirective,
    directive,
    noChange,
} from '../../node_modules/lit-html/lit-html.js';
import { ThemedComponent } from './themed-component.js';
import { WebComponent } from '../../build/es/wc-lib.js';

export const theme = {
    // Theme can contain any values that are valid in CSS
    light: {
        background: '#EEEEEE',
        primary: 'blue',
        secondary: 'red',
        regular: 'rgb(0, 0, 0)',
    },
    dark: {
        background: '#111111',
        primary: 'yellow',
        secondary: 'purple',
        regular: 'rgb(255, 255, 255)',
    },
};

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
WebComponent.initTheme({
    theme: theme,
    defaultTheme: 'light',
});
ThemedComponent.define();
