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
	styles: `
		@-webkit-keyframes loaderspin-animation {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(360deg);
			}
		}

		@keyframes loaderspin-animation {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(360deg);
			}
		}

		.loaderspin {
			display: block;
			position: relative;
		}
		.loaderspin:before {
			-webkit-animation: loaderspin-animation 1s linear infinite;
			animation: loaderspin-animation 1s linear infinite;
			border: 2px solid transparent;
			border-bottom-color: var(--color-light4);
			border-left-color: var(--color-light4);
			border-radius: calc(var(--gridspacing) * 2);
			border-right-color: var(--color-light4);
			border-top-color: var(--color-interactive2);
			content: '';
			height: calc(var(--gridspacing) * 2);
			right: 0;
			position: absolute;
			top: 0;
			width: calc(var(--gridspacing) * 2);
		}

		.loaderspin-medium {
			height: calc(var(--gridspacing) * 4);
			width: calc(var(--gridspacing) * 4);
		}
		.loaderspin-medium:before {
			border-radius: calc(var(--gridspacing) * 4);
			height: calc(var(--gridspacing) * 4);
			width: calc(var(--gridspacing) * 4);
		}

		.loaderspin-large {
			height: calc(var(--gridspacing) * 8);
			width: calc(var(--gridspacing) * 8);
		}
		.loaderspin-large:before {
			border-radius: calc(var(--gridspacing) * 8);
			height: calc(var(--gridspacing) * 8);
			width: calc(var(--gridspacing) * 8);
		}
	`,
	imports: [NgIf, HlmPDirective, TranslatePipe],
})
export class LoadingDotsComponent {
	@Input() className: string;
	@Input() showLoading: boolean = true;
}
