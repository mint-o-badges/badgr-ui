import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';

import {SignupSuccessComponent} from './signup-success.component';
import {Title} from '@angular/platform-browser';
import { RouterTestingModule } from "@angular/router/testing";
import { BadgrCommonModule, COMMON_IMPORTS } from "../../../common/badgr-common.module";
import {
	COMMON_MOCKS_PROVIDERS_WITH_SUBS,
} from "../../../mocks/mocks.module.spec";
import { CommonEntityManagerModule } from "../../../entity-manager/entity-manager.module";


describe('SignupSuccessComponent', () => {
	let component: SignupSuccessComponent;
  let fixture: ComponentFixture<SignupSuccessComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
          imports: [
              ...COMMON_IMPORTS,
              BadgrCommonModule,
              CommonEntityManagerModule,
              RouterTestingModule,
          ],
          declarations: [
              SignupSuccessComponent
          ],
          providers: [
              Title,
              ...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
              {
                  provide: ActivatedRoute,
                  useValue: {
                      snapshot: { params: { email: btoa('mail@example.org') } }
                  }
              }
          ],
          schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
          teardown: { destroyAfterEach: false },
      })
		.compileComponents();
		fixture = TestBed.createComponent(SignupSuccessComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

  it('should create a component', async () => {
    expect(component).toBeTruthy();
  });

  it('should run #ngOnInit()', async () => {
    const result = component.ngOnInit();
  });

});
