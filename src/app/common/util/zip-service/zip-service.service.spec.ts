import { TestBed } from '@angular/core/testing';

import { ZipService } from './zip-service.service';
import { RouterTestingModule } from "@angular/router/testing";
import { CommonModule } from "@angular/common";
import { COMMON_IMPORTS } from "../../badgr-common.module";
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../../mocks/mocks.module.spec";

describe('ZipService', () => {
  beforeEach(() => TestBed.configureTestingModule({
		imports: [
			...COMMON_IMPORTS,
		],
		providers: [
			...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
		],
	}));

  it('should be created', () => {
    const service: ZipService = TestBed.inject(ZipService);
    expect(service).toBeTruthy();
  });
});
