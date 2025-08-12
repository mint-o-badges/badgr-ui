import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTabsModule, HlmTabsTriggerDirective } from './spartan/ui-tabs-helm/src';
import { NgTemplateOutlet } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { type TabsVariants } from './spartan/ui-tabs-helm/src';

export const bg = 'tw-block tw-absolute tw-z-0 tw-opacity-80';

export type Tab = {
	key: string;
	title: string;
	count?: number;
	component: any;
};

@Component({
	selector: 'oeb-tabs',
	imports: [HlmTabsModule, HlmTabsTriggerDirective, NgTemplateOutlet, TranslateModule],
	template: `<hlm-tabs class="tw-block tw-w-full" [tab]="activeTab" (tabActivated)="onTabChange($event)">
		<hlm-tabs-list class="tw-w-full tw-max-w-[660px] tw-flex tw-justify-between" aria-label="tabs">
			@for (tab of tabs; track tab) {
				<button class="tw-grow" [hlmTabsTrigger]="tab.key" [variant]="variant">
					{{ tab.title | translate }}
					@if (tab.count) {
						<div
							class="md:tw-w-7 md:tw-h-7 tw-h-5 tw-w-5 tw-flex tw-items-center tw-justify-center tw-ml-2 tw-p-1 tw-rounded-full tw-bg-purple tw-text-white tw-text-sm"
						>
							{{ tab.count }}
						</div>
					}
				</button>
			}
		</hlm-tabs-list>
		@for (tab of tabs; track tab) {
			<div [hlmTabsContent]="tab.key">
				<ng-template *ngTemplateOutlet="tab.component"></ng-template>
			</div>
		}
	</hlm-tabs>`,
})
export class OebTabsComponent {
	@Input() image: string;
	@Input() imgClass: string;
	@Input() tabs: Tab[];
	@Input() activeTab: string;
	@Input() variant: TabsVariants['variant'] = 'default';
	@Output() onTabChanged = new EventEmitter();

	onTabChange(tab) {
		this.onTabChanged.emit(tab);
	}
}
