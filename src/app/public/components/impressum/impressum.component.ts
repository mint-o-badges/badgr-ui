import { Component, OnInit } from '@angular/core';
import { uiTimestamp } from '../../../../environments/timestamp';

@Component({
	selector: 'app-impressum',
	templateUrl: './impressum.component.html',
	styleUrls: ['./impressum.component.css'],
	standalone: false,
})
export class ImpressumComponent implements OnInit {
    uiTimestamp = uiTimestamp;
    constructor() {}
	ngOnInit() {}
}
