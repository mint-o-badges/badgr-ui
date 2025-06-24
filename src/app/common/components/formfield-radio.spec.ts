import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';

import { Component, Directive } from '@angular/core';
import { FormFieldRadio } from './formfield-radio';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_IMPORTS } from '../badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../mocks/mocks.module.spec';
import { FormControl, Validators } from '@angular/forms';

describe('FormFieldRadio', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
    imports: [RouterTestingModule, ...COMMON_IMPORTS, FormFieldRadio],
    providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
}).compileComponents();
		fixture = TestBed.createComponent(FormFieldRadio);
		fixture.componentInstance.control = new FormControl('', Validators.required);
		fixture.detectChanges();
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #ngOnInit()', async () => {
		const result = component.ngOnInit();
	});

	it('should run #ngAfterViewInit()', async () => {
		const result = component.ngAfterViewInit();
	});

	xit('should run #ngOnChanges()', async () => {
		// const result = component.ngOnChanges(changes);
	});

	it('should run #updateDisabled()', async () => {
		const result = component.updateDisabled();
	});

	it('should run #unlock()', async () => {
		const result = component.unlock();
	});

	xit('should run #cacheControlState()', async () => {
		const result = component.cacheControlState();
	});

	it('should run #focus()', async () => {
		const result = component.focus();
	});

	it('should run #select()', async () => {
		const result = component.select();
	});
});
