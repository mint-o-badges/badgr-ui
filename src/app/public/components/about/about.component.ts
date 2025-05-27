import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-about',
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.css'],
	standalone: false,
})
export class AboutComponent implements OnInit {
	mailAddress = 'support@openbadges.education';
	mailBody = 'Interesse an Open Educational Badges';
	constructor(public translate: TranslateService) {}

	ngOnInit() {}
}
