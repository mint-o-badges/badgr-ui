// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { Component, Directive, ElementRef, Renderer2 } from '@angular/core';
import { AddBadgeDialogComponent } from './add-badge-dialog.component';
import { RecipientBadgeManager } from '../../services/recipient-badge-manager.service';
import { FormBuilder } from '@angular/forms';
import { MessageService } from '../../../common/services/message.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../../mocks/mocks.module.spec';

describe('AddBadgeDialogComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
    imports: [
        RouterTestingModule,
        CommonModule,
        BadgrCommonModule,
        TranslateTestingModule.withTranslations('de', {}),
        ...COMMON_IMPORTS,
        AddBadgeDialogComponent,
    ],
    providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
}).compileComponents();
		fixture = TestBed.createComponent(AddBadgeDialogComponent);
		component = fixture.debugElement.componentInstance;
		component.open = false;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	xit('should run #openDialog()', async () => {
		// const result = component.openDialog(customOptions);
	});

	xit('should run #closeDialog()', async () => {
		const result = component.closeDialog();
	});

	xit('should run #uploadImage()', async () => {
		const result = component.uploadImage('email', 'image');
	});

	xit('should run #controlUpdated()', async () => {
		// const result = component.controlUpdated(updatedControl);
	});

	it('should run #clearFormError()', async () => {
		const result = component.clearFormError();
	});
});
