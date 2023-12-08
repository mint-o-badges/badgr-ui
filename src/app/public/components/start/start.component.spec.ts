import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StartComponent } from './start.component';
import { TranslateModule } from '@ngx-translate/core';

describe('StartComponent', () => {
  let component: StartComponent;
  let fixture: ComponentFixture<StartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports:[TranslateModule],
      declarations: [ StartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
