import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css'],
    imports: [NgIf],
})
export class AboutComponent implements OnInit {
	mailAddress = 'support@openbadges.education';
	mailBody = 'Interesse an Open Educational Badges';
	constructor(
		public translate: TranslateService,
	) {}

	ngOnInit() {}
}
