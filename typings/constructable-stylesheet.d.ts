interface CSSStyleSheet {
	insertRule(rule: string, index?: number): number;
	deleteRule(index: number): void;
	replace(text: string): Promise<CSSStyleSheet>;
	replaceSync(text: string): void;
}

interface ShadowRoot {
	adoptedStyleSheets: CSSStyleSheet[];
}