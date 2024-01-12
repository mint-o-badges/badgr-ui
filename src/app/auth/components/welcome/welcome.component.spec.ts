import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../../mocks/mocks.module.spec";
import { COMMON_IMPORTS } from "../../../common/badgr-common.module";
import { RouterTestingModule } from "@angular/router/testing";
import { TranslateTestingModule } from "ngx-translate-testing";

import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomeComponent ],
      imports: [
          ...COMMON_IMPORTS,
          RouterTestingModule,
          TranslateTestingModule.withTranslations('de', {}),
      ],
      providers: [
          ...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
