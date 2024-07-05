import { Component, EventEmitter, Input, Output } from '@angular/core';
import { lucideClock } from '@ng-icons/lucide';
import { provideIcons } from '../../components/spartan/ui-icon-helm/src';

@Component({
	selector: 'oeb-competency',
    providers: [provideIcons({ lucideClock })],
	host: {
		class: 'tw-rounded-[10px] tw-bg-oebgrey tw-border-purple tw-border-solid tw-border tw-relative tw-p-[calc(var(--gridspacing)*2)] tw-block tw-overflow-hidden',
	},
	template: `
		<div class="tw-flex tw-justify-between tw-items-center">
            <div>
                <span hlmP size="sm" class="tw-text-oebblack tw-font-medium">{{competency.name}} </span>
                <a hlmP hlmA size="sm" target="_blank" [href]="'http://data.europa.eu' + competency.escoID" text="inline link">(E)</a>
            </div>
            
            <div class="tw-text-purple tw-flex tw-items-center tw-whitespace-nowrap">
                <hlm-icon class="tw-mr-2" size="sm" name="lucideClock"/>
                {{competency.studyLoad}}
            </div>
		</div>
	`,
})
export class OebCompetency {
	@Input() competency: any;
}
