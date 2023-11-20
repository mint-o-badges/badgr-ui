import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {IssuerStaffCreateDialogComponent} from './issuer-staff-create-dialog.component';
import {BadgrCommonModule, COMMON_IMPORTS} from '../../../common/badgr-common.module';
import {CommonEntityManagerModule} from '../../../entity-manager/entity-manager.module';
import { RouterTestingModule } from "@angular/router/testing";
import { CommonModule } from "@angular/common";
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../../mocks/mocks.module.spec";

describe('IssuerStaffCreateDialogComponent', () => {
  let component: IssuerStaffCreateDialogComponent;
  let fixture: ComponentFixture<IssuerStaffCreateDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuerStaffCreateDialogComponent ],
			imports: [
				RouterTestingModule,
				CommonModule,
				BadgrCommonModule,
				...COMMON_IMPORTS,
			],
			providers: [
				...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
			],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuerStaffCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
