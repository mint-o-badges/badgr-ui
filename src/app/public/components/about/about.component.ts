import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// @Component({
// 	selector: 'app-about',
// 	templateUrl: './about.component.html',
// 	styleUrls: ['./about.component.css'],
// 	standalone: false,
// })
// export class AboutComponent implements OnInit {
// 	mailAddress = 'support@openbadges.education';
// 	mailBody = 'Interesse an Open Educational Badges';
// 	constructor() {}

// 	ngOnInit() {}
// }
@Component({
	selector: 'app-about',
	template: `<cms-page [slug]="translate.currentLang == 'de' ? 'ueber-oeb' : 'about-oeb'" />`,
	standalone: false,
})
export class AboutComponent {
	constructor(
		protected translate: TranslateService,
	) {}
}
