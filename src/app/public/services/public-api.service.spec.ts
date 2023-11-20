import { waitForAsync } from '@angular/core/testing';
import {PublicApiService} from './public-api.service';

xdescribe('PublicApiService', () => {
  let service;

  const loginService: any = {
    // mock properties here 
  }

  const http: any = {
    // mock properties here 
  }

  const configService: any = {
    // mock properties here 
  }

  const messageService: any = {
    // mock properties here 
  }

  beforeEach(() => {
    service = new PublicApiService(loginService,http,configService,messageService);
  });

  it('should run #getBadgeAssertion()', async () => {
    // const result = getBadgeAssertion(assertionId);
  });

  it('should run #getBadgeClass()', async () => {
    // const result = getBadgeClass(badgeId);
  });

  it('should run #getIssuer()', async () => {
    // const result = getIssuer(issuerId);
  });

  it('should run #getIssuerBadges()', async () => {
    // const result = getIssuerBadges(issuerId);
  });

  it('should run #getIssuerWithBadges()', async () => {
    // const result = getIssuerWithBadges(issuerId);
  });

  it('should run #getBadgeCollection()', async () => {
    // const result = getBadgeCollection(shareHash);
  });

});
