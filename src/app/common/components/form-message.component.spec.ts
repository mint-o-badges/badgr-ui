import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Component, Directive, ElementRef } from '@angular/core';
import { FormMessageComponent } from './form-message.component';
import { MessageService } from '../services/message.service';
import { Data, Router } from '@angular/router';
import { EventsService } from '../services/events.service';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../mocks/mocks.module.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_IMPORTS } from '../badgr-common.module';

describe('FormMessageComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [FormMessageComponent],
			imports: [RouterTestingModule, CommonModule, ...COMMON_IMPORTS],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			teardown: { destroyAfterEach: false },
		}).compileComponents();
		fixture = TestBed.createComponent(FormMessageComponent);
		component = fixture.debugElement.componentInstance;
		component.click = new MouseEvent('click');
		component.click.nativeElement = null;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	xit('should run #ngOnDestroy()', async () => {
		const result = component.ngOnDestroy();
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	it('should run #onDocumentClick()', async () => {
		const result = component.onDocumentClick(component.click);
	});

	it('should run #toNotification()', async () => {
		const result = component.toNotification('status');
	});

	it('should run #setMessage()', async () => {
		const result = component.setMessage('message');
	});

	it('should run #dismissMessage()', async () => {
		const result = component.dismissMessage();
	});
});
