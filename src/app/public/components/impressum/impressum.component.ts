import { Component, OnInit } from '@angular/core';
import { uiTimestamp } from '../../../../environments/timestamp';
import { ServerTimestampService } from '../../../common/services/server-timestamp.service';

@Component({
	selector: 'app-impressum',
	templateUrl: './impressum.component.html',
	styleUrls: ['./impressum.component.css'],
	standalone: false,
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
