import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../../mocks/mocks.module.spec";
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { RouterTestingModule } from "@angular/router/testing";
import { TranslateTestingModule } from "ngx-translate-testing";

import { IssuerCatalogComponent } from './issuer-catalog.component';

describe('IssuerCatalogComponent', () => {
  let component: IssuerCatalogComponent;
  let fixture: ComponentFixture<IssuerCatalogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuerCatalogComponent ],
      imports: [
          ...COMMON_IMPORTS,
          BadgrCommonModule,
          RouterTestingModule,
          TranslateTestingModule.withTranslations('de', {}),
      ],
      providers: [
          ...COMMON_MOCKS_PROVIDERS_WITH_SUBS,
      ],
      teardown: { destroyAfterEach: false },
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuerCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
