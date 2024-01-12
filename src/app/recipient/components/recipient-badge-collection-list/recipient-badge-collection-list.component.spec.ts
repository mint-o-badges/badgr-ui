// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import {Component, Directive} from '@angular/core';
import {RecipientBadgeCollectionListComponent} from './recipient-badge-collection-list.component';
import {Router, ActivatedRoute} from '@angular/router';
import {SessionService} from '../../../common/services/session.service';
import {FormBuilder} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {MessageService} from '../../../common/services/message.service';
import {RecipientBadgeCollectionManager} from '../../services/recipient-badge-collection-manager.service';
import {RecipientBadgeManager} from '../../services/recipient-badge-manager.service';
import {AppConfigService} from '../../../common/app-config.service';
import {CommonDialogsService} from '../../../common/services/common-dialogs.service';
import { RouterTestingModule } from "@angular/router/testing";
import { BadgrCommonModule, COMMON_IMPORTS } from "../../../common/badgr-common.module";
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../../mocks/mocks.module.spec";

describe('RecipientBadgeCollectionListComponent', () => {
  let fixture;
  let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        RecipientBadgeCollectionListComponent
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
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
    fixture = TestBed.createComponent(RecipientBadgeCollectionListComponent);
    component = fixture.debugElement.componentInstance;
  });

  it('should create a component', async () => {
    expect(component).toBeTruthy();
  });

  xit('should run #togglePublishCollection()', async () => {
    // const result = component.togglePublishCollection(collection);
  });

  xit('should run #shareCollection()', async () => {
    // const result = component.shareCollection(collection);
  });

  it('should run #ngOnInit()', async () => {
    const result = component.ngOnInit();
  });

});
