import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuerStaffCreateDialogComponent } from './issuer-staff-create-dialog.component';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { CommonEntityManagerModule } from '../../../entity-manager/entity-manager.module';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('IssuerStaffCreateDialogComponent', () => {
	let component: IssuerStaffCreateDialogComponent;
	let fixture: ComponentFixture<IssuerStaffCreateDialogComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				RouterTestingModule,
				CommonModule,
				BadgrCommonModule,
				TranslateTestingModule.withTranslations('de', {}),
				...COMMON_IMPORTS,
				IssuerStaffCreateDialogComponent,
			],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
		}).compileComponents();
		fixture = TestBed.createComponent(IssuerStaffCreateDialogComponent);
		fixture.detectChanges();
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
