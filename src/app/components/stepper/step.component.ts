import { Component, Input } from '@angular/core';
import { CdkStep } from '@angular/cdk/stepper';

@Component({
	selector: 'oeb-step',
	template: '<ng-template><ng-content/></ng-template>',
	providers: [
		{
			provide: CdkStep,
			useExisting: StepComponent,
		},
	],
	standalone: false,
})
export class StepComponent extends CdkStep {
	@Input()
	route: string[];
}
