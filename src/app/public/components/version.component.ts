import { Component } from '@angular/core';
import { uiTimestamp } from 'src/environments/timestamp';
import { ServerTimestampService } from '~/common/services/server-timestamp.service';

@Component({
	selector: 'oeb-version',
	template: `
		<p style="font-size: 1.1rem; color: black; line-height: 1.55">
			<span style="display: block; font-weight: bold; margin-bottom: 15px">Version</span>
			UI: {{ uiTimestamp }} <br />
			Server: {{ serverTimestamp }}
			<br />
		</p>
	`,
})
export class VersionComponent {
	uiTimestamp = uiTimestamp;
	serverTimestamp = '?';
	constructor(protected serverTimestampService: ServerTimestampService) {
		serverTimestampService.getServerTimestamp().then(
			(ts) => {
				this.serverTimestamp = ts;
			},
			(error) => {
				throw error;
			},
		);
	}
}
