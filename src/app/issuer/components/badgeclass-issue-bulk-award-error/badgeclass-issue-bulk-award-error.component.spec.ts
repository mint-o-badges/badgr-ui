// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import {Component, Directive} from '@angular/core';
import {BadgeclassIssueBulkAwardError} from './badgeclass-issue-bulk-award-error.component';
import {FormBuilder} from '@angular/forms';
import {SessionService} from '../../../common/services/session.service';
import {MessageService} from '../../../common/services/message.service';
import {Router, ActivatedRoute} from '@angular/router';
import {Title} from '@angular/platform-browser';
import { RouterTestingModule } from "@angular/router/testing";
import { COMMON_IMPORTS } from "../../../common/badgr-common.module";
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../../mocks/mocks.module.spec";


describe('BadgeclassIssueBulkAwardError', () => {
  let fixture;
  let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BadgeclassIssueBulkAwardError
      ],
			imports: [
				RouterTestingModule,
				CommonModule,
				...COMMON_IMPORTS,
			],
			providers: [
				...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
			],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
    fixture = TestBed.createComponent(BadgeclassIssueBulkAwardError);
    component = fixture.debugElement.componentInstance;
  });

  it('should create a component', async () => {
    expect(component).toBeTruthy();
  });

  it('should run #ngOnInit()', async () => {
    // const result = component.ngOnInit();
  });

  it('should run #initImportErrorForm()', async () => {
    // const result = component.initImportErrorForm();
  });

  it('should run #continueButtonAction()', async () => {
    // const result = component.continueButtonAction();
  });

  it('should run #updateViewState()', async () => {
    // const result = component.updateViewState(state);
  });

  it('should run #removeDuplicateEmails()', async () => {
    // const result = component.removeDuplicateEmails();
  });

  it('should run #markFormControllsAsDirty()', async () => {
    // const result = component.markFormControllsAsDirty();
  });

  it('should run #removeButtonErrorState()', async () => {
    // const result = component.removeButtonErrorState(row);
  });

  it('should run #removeInvalidRowsTransformed()', async () => {
    // const result = component.removeInvalidRowsTransformed(i);
  });

  it('should run #removeErrorFormControll()', async () => {
    // const result = component.removeErrorFormControll(controlIndex);
  });

});
