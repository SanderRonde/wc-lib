/// <reference types="Cypress" />

import { templateManagerSpec } from './templateManagerspec';
import { getClassFixture } from '../../../lib/testing';

templateManagerSpec({
    standard: getClassFixture('template-manager'),
    wrong: getClassFixture('template-manager', 'wrong'),
});
