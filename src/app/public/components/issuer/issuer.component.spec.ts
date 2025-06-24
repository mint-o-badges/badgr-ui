// tslint:disable
import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicIssuerComponent } from './issuer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';

describe('PublicIssuerComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
    imports: [RouterTestingModule, CommonModule, BadgrCommonModule, ...COMMON_IMPORTS, PublicIssuerComponent],
    providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
}).compileComponents();
		fixture = TestBed.createComponent(PublicIssuerComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});
});
