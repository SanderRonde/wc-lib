/// <reference types="Cypress" />

import { getClassFixture } from '../../../lib/testing';
import { baseSpec } from './basespec';

baseSpec(getClassFixture('base'));
