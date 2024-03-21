import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-faq',
	templateUrl: './faq.component.html',
	styleUrls: ['./faq.component.css'],
})
export class FaqComponent implements OnInit {
	constructor() {}
	items = [1, 2, 3, 4];

	ngOnInit() {}
}
