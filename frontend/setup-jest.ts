// setup-jest.ts

// 1. Importer Zone.js avant tout
import 'zone.js';
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

// 2. Initialiser l'environnement de test Angular
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);
