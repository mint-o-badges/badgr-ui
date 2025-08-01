import { Component, Input, OnInit, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { BrnProgressComponent, BrnProgressIndicatorComponent } from '@spartan-ng/brain/progress';
import { HlmProgressIndicatorDirective } from './spartan/ui-progress-helm/src';
import { NgTemplateOutlet } from '@angular/common';

@Component({
	selector: 'oeb-progress',
	imports: [BrnProgressComponent, BrnProgressIndicatorComponent, HlmProgressIndicatorDirective, NgTemplateOutlet],
	template: `
		<brn-progress [class]="class" hlm aria-labelledby="loading" [value]="progressValue">
			<brn-progress-indicator hlm />
			@if (template) {
				<ng-container *ngTemplateOutlet="template"></ng-container>
			}
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
