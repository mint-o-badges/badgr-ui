import { waitForAsync } from '@angular/core/testing';
import {ExternalToolsApiService} from './externaltools-api.service';

xdescribe('ExternalToolsApiService', () => {
  let service;

  const loginService: any = {
    // mock properties here 
  };

  const http: any = {
    // mock properties here 
  };

  const configService: any = {
    // mock properties here 
  };

  const messageService: any = {
    // mock properties here 
  };

  beforeEach(() => {
    service = new ExternalToolsApiService(loginService,http,configService,messageService);
  });

  it('should run #listTools()', async () => {
    // const result = listTools();
  });

  it('should run #getLaunchToolInfo()', async () => {
    // const result = getLaunchToolInfo(launchpoint, contextId);
  });

});
