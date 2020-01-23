/// <reference types="Cypress" />

import { getClassFixture } from '../../../lib/testing.js';
import { componentSpec } from './componentspec';

componentSpec(getClassFixture('component'));
