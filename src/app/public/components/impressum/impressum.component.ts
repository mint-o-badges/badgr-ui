import { Component, OnInit } from '@angular/core';
import { VERSION } from '../../../../environments/version';
import { ServerVersionService } from '../../../common/services/server-version.service';

@Component({
    selector: 'app-impressum',
    templateUrl: './impressum.component.html',
    styleUrls: ['./impressum.component.css'],
    standalone: false
})
export class ImpressumComponent implements OnInit {

    version = VERSION;
    serverVersion = '?';

	constructor(protected serverVersionService: ServerVersionService) {
        serverVersionService.getServerVersion().then(
            (v) => { this.serverVersion = v; },
            (error) => { throw error; });
    }

	ngOnInit() {}
}
