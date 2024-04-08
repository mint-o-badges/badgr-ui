// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive, ElementRef, Renderer2, NgZone } from '@angular/core';
import { BgPopupMenu } from './bg-popup-menu.component';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_IMPORTS } from '../badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../mocks/mocks.module.spec';

@Injectable()
class MockElementRef {
	// constructor() { super(undefined); }
	nativeElement = {};
}
describe('BgPopupMenu', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BgPopupMenu],
			imports: [RouterTestingModule, ...COMMON_IMPORTS],
			providers: [
				...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
				//{provide: ElementRef, useClass: MockElementRef},
				Renderer2,
				// NgZone,
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(BgPopupMenu);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	xit('should run #open()', async () => {
		// const result = component.open(triggerElem);
	});

	it('should run #close()', async () => {
		const result = component.close();
	});

	xit('should run #toggle()', async () => {
		// const result = component.toggle(triggerElem);
	});

	it('should run #ngAfterViewInit()', async () => {
		component.ngAfterViewInit();
	});

	it('should run #ngOnDestroy()', async () => {
		component.ngOnDestroy();
	});

	it('should run #handleClick()', async () => {
		const result = component.handleClick(new Event('click'));
	});

	it('should run #hideElem()', async () => {
		const result = component.hideElem();
	});
});
