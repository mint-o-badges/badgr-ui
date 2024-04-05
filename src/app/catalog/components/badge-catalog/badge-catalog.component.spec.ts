import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { CommonModule } from '@angular/common';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { BadgeCatalogComponent } from './badge-catalog.component';

describe('BadgeCatalogComponent', () => {
	let component: BadgeCatalogComponent;
	let fixture: ComponentFixture<BadgeCatalogComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [BadgeCatalogComponent],
			imports: [
				...COMMON_IMPORTS,
				CommonModule,
				BadgrCommonModule,
				RouterTestingModule,
				TranslateTestingModule.withTranslations('de', {}),
			],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BadgeCatalogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
