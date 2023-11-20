// tslint:disable
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/throw';

import {Component, Directive, ElementRef} from '@angular/core';
import {BgIssuerLinkComponent} from './issuer-link.component';
import { RouterTestingModule } from "@angular/router/testing";
import { COMMON_IMPORTS } from "../badgr-common.module";
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../mocks/mocks.module.spec";
import { FormFieldText } from "./formfield-text";
import { BadgrButtonComponent } from "./badgr-button.component";
import { BgImageStatusPlaceholderDirective } from "../directives/bg-image-status-placeholder.directive";

describe('BgIssuerLinkComponent', () => {
  let fixture;
  let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BgIssuerLinkComponent,
				BadgrButtonComponent,
				BgImageStatusPlaceholderDirective
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
    fixture = TestBed.createComponent(BgIssuerLinkComponent);
    component = fixture.debugElement.componentInstance;
  });

  it('should create a component', async () => {
    expect(component).toBeTruthy();
  });

  xit('should run #ngOnChanges()', async () => {
    // const result = component.ngOnChanges(changes);
  });

});
