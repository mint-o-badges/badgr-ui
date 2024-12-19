import { Component, EventEmitter, Input, Output } from '@angular/core';
import { lucideClock } from '@ng-icons/lucide';
import { provideIcons } from '../../components/spartan/ui-icon-helm/src';
import { Competency } from '../model/competency.model';

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
                <a *ngIf="competency['framework_identifier']" hlmP hlmA size="sm" target="_blank" [href]="competency['framework_identifier']" text="inline link">(E)</a>
            </div>
            
            <div class="tw-text-purple tw-flex tw-items-center tw-whitespace-nowrap">
                <span hlmP size="sm" *ngIf="new" class="tw-bg-yellow tw-px-2 tw-mr-2 tw-rounded-[10px]">NEU</span>
                <hlm-icon class="tw-mr-2" size="sm" name="lucideClock"/>
                {{competency.studyLoad | hourPipe}}
            </div>
		</div>
	`,
})
export class OebCompetency {
	@Input() competency: Competency;
	@Input() new: boolean = false;
}
