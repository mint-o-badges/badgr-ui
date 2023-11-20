// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import {Component, Directive} from '@angular/core';
import {OAuthAppDetailComponent} from './oauth-app-detail.component';
import {SessionService} from '../../../common/services/session.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {MessageService} from '../../../common/services/message.service';
import {OAuthManager} from '../../../common/services/oauth-manager.service';
import {AppConfigService} from '../../../common/app-config.service';
import {CommonDialogsService} from '../../../common/services/common-dialogs.service';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../../mocks/mocks.module.spec";
import { BadgrCommonModule, COMMON_IMPORTS } from "../../../common/badgr-common.module";
import { RouterTestingModule } from "@angular/router/testing";

describe('OAuthAppDetailComponent', () => {
  let fixture;
  let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        OAuthAppDetailComponent,
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
    fixture = TestBed.createComponent(OAuthAppDetailComponent);
    component = fixture.debugElement.componentInstance;
  });

  it('should create a component', async () => {
    expect(component).toBeTruthy();
  });

  xit('should run #permisionScopeToIconName()', async () => {
    // const result = component.permisionScopeToIconName(scope);
  });

  it('should run #ngOnInit()', async () => {
    const result = component.ngOnInit();
  });

  xit('should run #revokeAccess()', async () => {
    const result = component.revokeAccess();
  });

});
