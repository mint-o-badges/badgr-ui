import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BadgeCatalogComponent } from './badge-catalog.component';

describe('BadgeCatalogComponent', () => {
  let component: BadgeCatalogComponent;
  let fixture: ComponentFixture<BadgeCatalogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgeCatalogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
