import { Component, OnInit } from '@angular/core';
import { FormMessageComponent } from '../../../common/components/form-message.component';

@Component({
    selector: 'app-privacy',
    templateUrl: './privacy.component.html',
    styleUrls: ['./privacy.component.css'],
    imports: [FormMessageComponent],
})
export class PrivacyComponent implements OnInit {
	constructor() {}

	ngOnInit() {}
}
