import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';

import { PrivacyComponent } from './privacy.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PrivacyComponent', () => {
	let component: PrivacyComponent;
	let fixture: ComponentFixture<PrivacyComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [PrivacyComponent],
			imports: [...COMMON_IMPORTS, BadgrCommonModule, TranslateTestingModule.withTranslations('de', {})],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			teardown: { destroyAfterEach: false },
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PrivacyComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
