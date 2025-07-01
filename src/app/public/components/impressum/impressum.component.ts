import { Component, OnInit } from '@angular/core';
import { uiTimestamp } from '../../../../environments/timestamp';
import { ServerTimestampService } from '../../../common/services/server-timestamp.service';
import { FormMessageComponent } from '../../../common/components/form-message.component';

@Component({
	selector: 'app-impressum',
	templateUrl: './impressum.component.html',
	styleUrls: ['./impressum.component.css'],
	imports: [FormMessageComponent],
})
export class ImpressumComponent implements OnInit {
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
	ngOnInit() {}
}
