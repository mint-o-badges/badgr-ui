import { Component, Input, OnInit, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { BrnProgressComponent, BrnProgressIndicatorComponent } from '@spartan-ng/brain/progress';
import { NgTemplateOutlet, NgIf } from '@angular/common';
import { HlmProgressIndicatorDirective } from './spartan/ui-progress-helm/src/lib/hlm-progress-indicator.directive';

@Component({
	selector: 'oeb-progress',
	imports: [
		BrnProgressComponent,
		BrnProgressIndicatorComponent,
		HlmProgressIndicatorDirective,
		NgTemplateOutlet,
		NgIf,
	],
	template: `
		<brn-progress [class]="class" hlm aria-labelledby="loading" [value]="progressValue">
			<brn-progress-indicator hlm />
			<ng-container *ngIf="template">
				<ng-container *ngTemplateOutlet="template"></ng-container>
			</ng-container>
		</brn-progress>
	`,
})
export class OebProgressComponent {
	@Input() value: number;
	@Input() class: string = '';
	@Input() template?: TemplateRef<any>;

	constructor(private cdr: ChangeDetectorRef) {}
	progressValue = 0;

	ngOnInit() {
		setTimeout(() => {
			this.progressValue = this.value;
			this.cdr.detectChanges();
		}, 1000);
	}
}
