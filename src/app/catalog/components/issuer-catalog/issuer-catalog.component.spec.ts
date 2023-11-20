import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IssuerCatalogComponent } from './issuer-catalog.component';

describe('IssuerCatalogComponent', () => {
  let component: IssuerCatalogComponent;
  let fixture: ComponentFixture<IssuerCatalogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuerCatalogComponent ]
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
