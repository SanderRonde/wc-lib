import {
    ThemedElementFactory,
    usedThemes,
} from '../../elements/themed-element.js';
import { WebComponent, noTheme } from '../../../../../../../build/es/wc-lib.js';
import { TestElementFactory } from '../../../elements/test-element-factory.js';

export interface ThemeManagerWindow extends Window {
    noTheme: typeof noTheme;
}
declare const window: ThemeManagerWindow;

export function themeManagerInvalidFixtureFactory(base: any) {
    WebComponent.initTheme({
        theme: usedThemes,
        defaultTheme: 'nonexistent-theme',
    });

    const { ThemedElementParent } = ThemedElementFactory(base);
    TestElementFactory(base).define(true);
    ThemedElementParent.define(true);

    window.noTheme = noTheme;
}
