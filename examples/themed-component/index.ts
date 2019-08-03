import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "lit-html";
import { ThemedComponent } from "./themed-component";
import { WebComponent } from "../../src/wclib";

export const theme = {
	// Theme can contain any values that are valid in CSS
	light: {
		background: '#FFFFFF',
		primary: 'blue',
		secondary: 'red',
		regular: 'rgb(0, 0, 0)'
	},
	dark: {
		background: '#000000',
		primary: 'yellow',
		secondary: 'purple',
		regular: 'rgb(255, 255, 255)'
	}
}

WebComponent.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});
WebComponent.initTheme({
	theme: theme,
	defaultTheme: 'light'
})
ThemedComponent.define();