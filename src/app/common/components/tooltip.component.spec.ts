// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';

import { Component, Directive } from '@angular/core';
import { TooltipComponent } from './tooltip.component';
import { ElementRef } from 'tether';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_IMPORTS } from '../badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../mocks/mocks.module.spec';
//import * as Tether from 'tether';

describe('TooltipComponent', () => {
	let fixture;
	let component;
	let tether;

	beforeEach(() => {
		TestBed.configureTestingModule({
    imports: [RouterTestingModule, CommonModule, ...COMMON_IMPORTS, TooltipComponent],
    providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    teardown: { destroyAfterEach: false },
}).compileComponents();
		fixture = TestBed.createComponent(TooltipComponent);
		fixture.detectChanges();
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	it('should run #toggleTip()', async () => {
		const result = component.toggleTip();
	});

	xit('should run #onOutClick()', async () => {
		// const result = component.onOutClick(targetElement);
	});

	it('should run #updateTip()', async () => {
		const result = component.updateTip(open);
	});

	it('should run #ngAfterViewInit()', async () => {
		const result = component.ngAfterViewInit();
	});

	xit('should run #ngOnDestroy()', async () => {
		const result = component.ngOnDestroy();
	});
});
