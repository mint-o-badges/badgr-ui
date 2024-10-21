import { Component, OnInit } from '@angular/core';
import { VERSION } from '../../../../environments/version';

@Component({
	selector: 'app-impressum',
	templateUrl: './impressum.component.html',
	styleUrls: ['./impressum.component.css'],
})
export class ImpressumComponent implements OnInit {

    version = VERSION;

	constructor() {}

	ngOnInit() {}
}
