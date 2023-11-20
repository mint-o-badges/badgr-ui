import { waitForAsync } from '@angular/core/testing';
import {CommonEntityManager} from './common-entity-manager.service';

xdescribe('CommonEntityManager', () => {
  let service;

  const injector: any = {
    // mock properties here 
  };

  beforeEach(() => {
    service = new CommonEntityManager(injector);
  });

});
