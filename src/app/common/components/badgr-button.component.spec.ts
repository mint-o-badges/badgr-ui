// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import { Component, Directive } from '@angular/core';
import { BadgrButtonComponent } from './badgr-button.component';
import { MessageService } from '../services/message.service';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_IMPORTS } from '../badgr-common.module';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from '../../mocks/mocks.module.spec';

@Injectable()
class MockMessageService {}

describe('BadgrButtonComponent', () => {
	let fixture;
	let component;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BadgrButtonComponent],
			imports: [RouterTestingModule, ...COMMON_IMPORTS],
			providers: [...COMMON_MOCKS_PROVIDERS_WITH_SUBS],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
		fixture = TestBed.createComponent(BadgrButtonComponent);
		component = fixture.debugElement.componentInstance;
	});

	it('should create a component', async () => {
		expect(component).toBeTruthy();
	});

	xit('should run #updatePromises()', async () => {
		// const result = component.updatePromises(promises);
	});
});
