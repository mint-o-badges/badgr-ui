import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTabsModule, HlmTabsTriggerDirective } from './spartan/ui-tabs-helm/src';
import { JsonPipe, NgIf, NgFor, NgTemplateOutlet } from '@angular/common';

export const bg = 'tw-block tw-absolute tw-z-0 tw-opacity-80';

export type Tab = {
		title: string;
		count?: number; 
		component: any;
}

@Component({
	selector: 'oeb-backpack-tabs',
	standalone: true,
	imports: [HlmTabsModule, HlmTabsTriggerDirective, NgIf, NgFor, JsonPipe, NgTemplateOutlet],
	template: `<hlm-tabs class="tw-block tw-w-full" [tab]="activeTab" (tabActivated)="onTabChange($event)">
		<hlm-tabs-list class="tw-w-full tw-max-w-[660px] tw-flex tw-justify-between" aria-label="tabs">
			<ng-container *ngFor="let tab of tabs">
				<button class="tw-grow" [hlmTabsTrigger]="tab.title" [variant]="variant">{{ tab.title }} 
					<div *ngIf="tab.count"
					class="md:tw-w-7 md:tw-h-7 tw-h-5 tw-w-5 tw-flex tw-items-center tw-justify-center tw-ml-2 tw-p-1 tw-rounded-full tw-bg-purple tw-text-white tw-text-sm">
						{{tab.count}}
					</div>
				</button>
			</ng-container>
		</hlm-tabs-list>
		<div *ngFor="let tab of tabs" [hlmTabsContent]="tab.title">
			<ng-template *ngTemplateOutlet="tab.component"></ng-template>
		</div>
	</hlm-tabs> `,
})
export class OebTabsComponent {
	@Input() image: string;
	@Input() imgClass: string;
	@Input() tabs: Tab[];
	@Input() activeTab: string;
	@Input() variant: string = 'default';
	@Output() onTabChanged = new EventEmitter();
    
	onTabChange(tab) {
		this.onTabChanged.emit(tab);
	}
}
