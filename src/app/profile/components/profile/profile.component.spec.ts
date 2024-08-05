// tslint:disable
import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('ProfileComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ProfileComponent],
			imports: [RouterTestingModule, CommonModule, BadgrCommonModule, ...COMMON_IMPORTS, TranslateModule.forRoot()],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			teardown: { destroyAfterEach: false },
		}).compileComponents();
		fixture = TestBed.createComponent(ProfileComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #sanitize()', async () => {
		const result = component.sanitize('url');
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	xit('should run #ngOnDestroy()', async () => {
		component.ngOnDestroy();
	});

	xit('should run #unlinkAccount()', async () => {
		// const result = component.unlinkAccount($event, socialAccount, accountsNum);
	});

	xit('should run #linkAccount()', async () => {
		// const result = component.linkAccount($event, info);
	});

	xit('should run #submitEmailForm()', async () => {
		const result = component.submitEmailForm();
	});

	xit('should run #clickConfirmRemove()', async () => {
		// const result = component.clickConfirmRemove(ev, email);
	});

	xit('should run #clickRemove()', async () => {
		// const result = component.clickRemove(ev, email);
	});

	it('should run #clickMakePrimary()', async () => {
		// const result = component.clickMakePrimary(ev, email);
	});

	xit('should run #clickResendVerification()', async () => {
		// const result = component.clickResendVerification(ev, email);
	});
});
