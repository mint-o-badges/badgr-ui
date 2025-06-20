import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

type FaqItem = {
	Q: string;
	A: { text: string }[];
	isActive?: boolean;
};

@Component({
	selector: 'app-faq',
	templateUrl: './faq.component.html',
	styleUrls: ['./faq.component.scss'],
	standalone: false,
})
export class FaqComponent implements OnInit {
	data: FaqItem[] = [];
	constructor(private translate: TranslateService) {}

	ngOnInit() {
		this.data = [
			{
				Q: 'FAQ.Q1',
				A: [
					{ text: 'FAQ.A1.1' },
					{ text: 'FAQ.A1.2' },
					{ text: 'FAQ.A1.3' },
					{ text: 'FAQ.A1.4' },
					{ text: 'FAQ.A1.5' },
					{ text: 'FAQ.A1.6' },
				],
			},
			{
				Q: 'FAQ.Q2',
				A: [{ text: 'FAQ.A2.1' }, { text: 'FAQ.A2.2' }, { text: 'FAQ.A2.3' }, { text: 'FAQ.A2.4' }],
			},
			{
				Q: 'FAQ.Q3',
				A: [{ text: 'FAQ.A3' }],
			},
			{
				Q: 'FAQ.Q4',
				A: [{ text: 'FAQ.A4' }],
			},
			{
				Q: 'FAQ.Q5',
				A: [{ text: 'FAQ.A5' }],
			},
			{
				Q: 'FAQ.Q6',
				A: [{ text: 'FAQ.A6' }],
			},
		];
	}

	//Inspired by https://stackblitz.com/edit/angular-accordion-demo-app

	toggleAccordian(event, index) {
		const element = event.target;
		element.classList.toggle('active');
		if (this.data[index].isActive) {
			this.data[index].isActive = false;
		} else {
			this.data[index].isActive = true;
		}
		const panel = element.nextElementSibling;
		if (panel.style.maxHeight) {
			panel.style.maxHeight = null;
		} else {
			panel.style.maxHeight = panel.scrollHeight + 'px';
		}
	}
}
