import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { LoginComponent } from './login.component';
import { FormBuilder } from '@angular/forms';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { CommonModule } from '@angular/common';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { CommonEntityManagerModule } from '../../../entity-manager/entity-manager.module';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { RecipientModule } from '../../../recipient/recipient.module';

describe('LoginComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				...COMMON_IMPORTS,
				BadgrCommonModule,
				CommonEntityManagerModule,
				RouterTestingModule.withRoutes([{ path: 'recipient', component: RecipientModule }]),
				TranslateTestingModule.withTranslations('de', {}),
			],
			declarations: [LoginComponent],
			providers: [FormBuilder, Title, ...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			teardown: { destroyAfterEach: false },
		}).compileComponents();
		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.debugElement.componentInstance;
		// spyOn(component.router, 'navigate').and.returnValue(true);
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	xit('should run #sanitize()', async () => {
		const result = component.sanitize('www.badger.com');
	});

	xit('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	xit('should run #ngAfterViewInit()', async () => {
		component.ngAfterViewInit();
	});

	xit('should run #submitAuth()', async () => {
		const result = component.submitAuth();
	});

	xit('should run #handleQueryParamCases()', async () => {
		const result = component.handleQueryParamCases();
	});

	it('should run #initVerifiedData()', async () => {
		const result = component.initVerifiedData();
	});
});
