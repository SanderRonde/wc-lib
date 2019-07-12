/// <reference types="Cypress" />

import { getClassFixture } from "../../../lib/testing.js";
import { themeManagerSpec } from "./themeManagerspec";

themeManagerSpec({
	standardFixture: getClassFixture('theme-manager'),
	invalidFixture: getClassFixture('theme-manager', 'invalid'),
	separateFixture: getClassFixture('theme-manager', 'separate'),
})