import { Component, inject } from '@angular/core';
import { uiTimestamp } from '../../../../environments/timestamp';
import { ServerTimestampService } from '../../../common/services/server-timestamp.service';
import { FormMessageComponent } from '../../../common/components/form-message.component';

@Component({
	selector: 'app-impressum',
	templateUrl: './impressum.component.html',
	styleUrls: ['./impressum.component.css'],
	imports: [FormMessageComponent],
})
export class ImpressumComponent {
	protected serverTimestampService = inject(ServerTimestampService);

	uiTimestamp = uiTimestamp;
	serverTimestamp = '?';

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);
	constructor() {
		const serverTimestampService = this.serverTimestampService;

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
