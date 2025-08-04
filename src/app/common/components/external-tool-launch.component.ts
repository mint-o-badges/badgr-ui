import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ApiExternalToolLaunchInfo } from '../../externaltools/models/externaltools-api.model';
import { EventsService } from '../services/events.service';
import { Subscription } from 'rxjs';

import { FormsModule } from '@angular/forms';

@Component({
	selector: 'external-tool-launch',
	template: `
		@if (toolLaunchInfo) {
			<form
				#toolLaunchForm
				action="{{ toolLaunchInfo.launch_url }}"
				method="POST"
				encType="application/x-www-form-urlencoded"
			>
				@for (key of objectKeys(toolLaunchInfo.launch_data); track key) {
					<input type="hidden" name="{{ key }}" value="{{ toolLaunchInfo.launch_data[key] }}" />
				}
			</form>
		}
	`,
	imports: [FormsModule],
})
export class ExternalToolLaunchComponent implements OnDestroy {
	objectKeys = Object.keys;

	@ViewChild('toolLaunchForm') toolLaunchForm;

	toolLaunchInfo: ApiExternalToolLaunchInfo;
	launchSubscription: Subscription;

	constructor(
		protected elementRef: ElementRef,
		protected eventsService: EventsService,
	) {
		this.launchSubscription = this.eventsService.externalToolLaunch.subscribe((launchInfo) => {
			this.toolLaunchInfo = launchInfo;
			setTimeout((_) => {
				this.toolLaunchForm.nativeElement.submit();
			});
		});
	}

	ngOnDestroy() {
		this.launchSubscription.unsubscribe();
	}
}
