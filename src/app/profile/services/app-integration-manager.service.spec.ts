import { waitForAsync } from '@angular/core/testing';
import {AppIntegrationManager} from './app-integration-manager.service';

describe('AppIntegrationManager', () => {
  let service;

  const commonManager: any = {
    // mock properties here 
  }

  const appIntegrationService: any = {
    // mock properties here 
  }

  beforeEach(() => {
    service = new AppIntegrationManager(commonManager,appIntegrationService);
  });

});
