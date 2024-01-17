import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMMON_MOCKS_PROVIDERS_WITH_SUBS } from "../../../mocks/mocks.module.spec";
import { BadgrCommonModule, COMMON_IMPORTS } from '../../../common/badgr-common.module';
import { RouterTestingModule } from "@angular/router/testing";
import { TranslateTestingModule } from "ngx-translate-testing";

import { IssuerCatalogComponent } from './issuer-catalog.component';

describe('IssuerCatalogComponent', () => {
    let component: IssuerCatalogComponent;
    let fixture: ComponentFixture<IssuerCatalogComponent>;

    beforeEach((() => {
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
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            teardown: { destroyAfterEach: false },
        })
        .compileComponents();
        fixture = TestBed.createComponent(IssuerCatalogComponent);
        fixture.detectChanges();
        component = fixture.componentInstance;
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
