import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    HlmTabsModule,
    HlmTabsTriggerDirective,
} from './spartan/ui-tabs-helm/src';
import { JsonPipe, NgFor, NgTemplateOutlet } from '@angular/common';
// import { useSignal } from '@preact/signals-react';

export const bg = 'tw-block tw-absolute tw-z-0 tw-opacity-80';

@Component({
	selector: 'oeb-backpack-tabs',
	standalone: true,
	imports: [HlmTabsModule, HlmTabsTriggerDirective, NgFor, JsonPipe, NgTemplateOutlet],
	template: `<hlm-tabs class='tw-block tw-w-full' tab="Badges" (tabActivated)="onTabChange($event)">
        <hlm-tabs-list class='tw-w-full tw-max-w-[580px] tw-grid tw-grid-cols-3' aria-label='tabs example'>
            <ng-container *ngFor="let tab of tabs">
                <button [hlmTabsTrigger]="tab.title" >{{tab.title}}</button>
            </ng-container>
        </hlm-tabs-list>
        <div  *ngFor="let tab of tabs" [hlmTabsContent]='tab.title'>
            <ng-template *ngTemplateOutlet="tab.component"></ng-template>
        </div>
    </hlm-tabs> 
    `,

})
export class OebTabsComponent {
	@Input() image: string;
	@Input() imgClass: string;
    @Input() tabs: any;
    @Output() onTabChanged = new EventEmitter();

    onTabChange(tab){
        this.onTabChanged.emit(tab)
    }
}
