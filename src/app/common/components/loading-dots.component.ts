import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { HlmPDirective } from '../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'loading-dots',
    template: ` <div class="tw-flex tw-flex-col tw-items-center tw-justify-center {{ className }}">
		<div class="loaderspin loaderspin-large"></div>
		<p *ngIf="showLoading" hlmP size="sm" class="tw-font-normal !tw-text-[16px] tw-text-grey-40 tw-pt-4">
			{{ 'General.loading' | translate }}
		</p>
	</div>`,
    imports: [
        NgIf,
        HlmPDirective,
        TranslatePipe,
    ],
})
export class LoadingDotsComponent {
	@Input() className: string;
	@Input() showLoading: boolean = true;
}
