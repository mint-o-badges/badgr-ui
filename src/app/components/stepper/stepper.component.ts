import {
	Component,
	OnInit,
	Input,
	ContentChildren,
	QueryList,
	AfterContentChecked,
	AfterContentInit,
	AfterViewInit,
	SimpleChanges,
	isDevMode,
	ChangeDetectorRef,
	ElementRef,
} from '@angular/core';
import { CdkStepper, STEPPER_GLOBAL_OPTIONS, CdkStep } from '@angular/cdk/stepper';
import { StepComponent } from './step.component';
import { Router } from '@angular/router';
import { Directionality } from '@angular/cdk/bidi';
import { NgFor, NgClass, NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'oeb-stepper',
    templateUrl: './stepper.component.html',
    styleUrls: ['./stepper.component.scss'],
    /* This custom stepper provides itself as CdkStepper so that it can be recognized
    / by other components. */
    providers: [
        {
            provide: CdkStepper,
            useExisting: StepperComponent,
        },
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { showError: true },
        },
    ],
    imports: [
        NgFor,
        NgClass,
        NgTemplateOutlet,
    ],
})
export class StepperComponent extends CdkStepper implements OnInit {
	@Input()
	initialStep: number = 0;

	router: Router;

	constructor(dir: Directionality, changeDetectorRef: ChangeDetectorRef, elementRef: ElementRef, router: Router) {
		super(dir, changeDetectorRef, elementRef);
		this.router = router;
	}

	onClick(index: number): void {
		const step = this.steps.get(index);
		if ((step as StepComponent).route) {
			this.router.navigate((step as StepComponent).route);
		} else {
			// prevent skipping non-completed steps if linear, exception for easier form debugging
			if (this.linear && !isDevMode()) {
				for (let i = 0; i < index; i += 1) {
					const s = this.steps.get(i);
					if (s && !s.completed) {
						return;
					}
				}
			}
			this.selectedIndex = index;
		}
	}

	ngOnInit() {
		if (this.initialStep !== 0) {
			this.selectedIndex = this.initialStep;
		}
	}

	// initialstep changes after init depending on how it's calculated
	ngOnChanges(changes: SimpleChanges) {
		if (changes.initialStep.currentValue != changes.initialStep.previousValue) {
			this.selectedIndex = this.initialStep;
		}
	}
}
