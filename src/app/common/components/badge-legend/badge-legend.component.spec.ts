import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BadgeLegendComponent } from './badge-legend.component';

describe('BadgeLegendComponent', () => {
  let component: BadgeLegendComponent;
  let fixture: ComponentFixture<BadgeLegendComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgeLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
