import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportModalComponent } from './import-modal.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { CommonModule } from '@angular/common';

describe('ImportModalComponent', () => {
	let component: ImportModalComponent;
	let fixture: ComponentFixture<ImportModalComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
    imports: [RouterTestingModule, CommonModule, BadgrCommonModule, ...COMMON_IMPORTS, ImportModalComponent],
    providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
}).compileComponents();
		fixture = TestBed.createComponent(ImportModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
