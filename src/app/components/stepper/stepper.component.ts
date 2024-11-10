import { Component, OnInit } from '@angular/core';
import { CdkStepper, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';


@Component({
  selector: 'oeb-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  /* This custom stepper provides itself as CdkStepper so that it can be recognized
  / by other components. */
  providers: [{ 
    provide: CdkStepper, useExisting: StepperComponent }, {
      provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true }
    }]
})
export class StepperComponent extends CdkStepper implements OnInit {

  onClick(index: number): void {
    this.selectedIndex = index;
  }

  ngOnInit() { 
  }

}