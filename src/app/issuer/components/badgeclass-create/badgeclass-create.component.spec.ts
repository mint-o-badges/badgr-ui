// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';

import { BadgeClass } from '../../models/badgeclass.model';
import { Component, Directive } from '@angular/core';
import { BadgeClassCreateComponent } from './badgeclass-create.component';
import { SessionService } from '../../../common/services/session.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MessageService } from '../../../common/services/message.service';
import { IssuerManager } from '../../services/issuer-manager.service';
import { AppConfigService } from '../../../common/app-config.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';

describe('BadgeClassCreateComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BadgeClassCreateComponent],
			imports: [RouterTestingModule, CommonModule, FormsModule, BadgrCommonModule, ...COMMON_IMPORTS],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(BadgeClassCreateComponent);
		fixture.detectChanges();
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	it('should run #badgeClassCreated()', async () => {
		const result = component.badgeClassCreated(new Promise(() => {}));
	});

	xit('should run #creationCanceled()', async () => {
		const result = component.creationCanceled();
	});

	it('should use the value from the fork dialog', async () => {
		let badgeClass = new BadgeClass(null);
		spyOn(component.dialogService.forkBadgeDialog, 'openDialog').and.returnValue(
			new Promise((resolve, reject) => {
				resolve(badgeClass);
			}),
		);
		await component.forkBadge();
		expect(component.copiedBadgeClass).toBe(badgeClass);
	});

	it('should use the value from the copy dialog', async () => {
		let badgeClass = new BadgeClass(null);
		spyOn(component.dialogService.copyBadgeDialog, 'openDialog').and.returnValue(
			new Promise((resolve, reject) => {
				resolve(badgeClass);
			}),
		);
		await component.copyBadge();
		expect(component.copiedBadgeClass).toBe(badgeClass);
	});
});
