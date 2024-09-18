import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { PageConfig } from './badge-detail.component.types';

@Component({
	selector: 'bg-badgedetail',
    templateUrl: './badge-detail.component.html',
    styleUrls: ['./badge-detail.component.scss'],
})
export class BgBadgeDetail {
    @Input() config: PageConfig;
    @Input() awaitPromises?: Promise<any>[];


}
