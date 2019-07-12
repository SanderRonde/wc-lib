/// <reference types="Cypress" />

import { getClassFixture } from "../../../lib/testing";
import { i18nManagerSpec } from "./i18nManagerspec";

i18nManagerSpec({
	standard: getClassFixture('i18n-manager'),
	root: getClassFixture('i18n-manager', 'root'),
	defaults: getClassFixture('i18n-manager', 'defaults')
});