// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import {Component, Directive} from '@angular/core';
import {BadgeclassIssueBulkAwardConformation} from './badgeclass-issue-bulk-award-confirmation.component';
import {BadgeInstanceManager} from '../../services/badgeinstance-manager.service';
import {SessionService} from '../../../common/services/session.service';
import {Router, ActivatedRoute} from '@angular/router';
import {MessageService} from '../../../common/services/message.service';
import {FormBuilder} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import { RouterTestingModule } from "@angular/router/testing";
import { BadgrCommonModule, COMMON_IMPORTS } from "../../../common/badgr-common.module";
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../../mocks/mocks.module.spec";


describe('BadgeclassIssueBulkAwardConformation', () => {
  let fixture;
  let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BadgeclassIssueBulkAwardConformation
      ],
			imports: [
				RouterTestingModule,
				CommonModule,
				BadgrCommonModule,
				...COMMON_IMPORTS,
			],
			providers: [
				...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
			],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
    fixture = TestBed.createComponent(BadgeclassIssueBulkAwardConformation);
    component = fixture.debugElement.componentInstance;
  });

  it('should create a component', async () => {
    expect(component).toBeTruthy();
  });

  it('should run #enableActionButton()', async () => {
    // const result = component.enableActionButton();
  });

  it('should run #disableActionButton()', async () => {
    // const result = component.disableActionButton();
  });

  it('should run #dataConfirmed()', async () => {
    // const result = component.dataConfirmed();
  });

  it('should run #updateViewState()', async () => {
    // const result = component.updateViewState(state);
  });

  it('should run #removeValidRowsTransformed()', async () => {
    // const result = component.removeValidRowsTransformed(row);
  });

});
