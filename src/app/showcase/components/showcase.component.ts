import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { EmailValidator } from '../../common/validators/email.validator';

import { typedFormGroup } from '../../common/util/typed-forms';

@Component({
	selector: 'oeb-showcase',
	templateUrl: './oeb-showcase.component.html',
	standalone: false,
})
export class ShowcaseComponent {
	public badges = [
		{
			image: 'test',
			description: 'adskadjadalsd',
			createdAt: '2009-06-15T13:45:30',
			recipientCount: 10,
		},
		{
			image: 'test2323',
			description: 'adskadjadalsd',
			createdAt: '2009-01-15T13:45:30',
			recipientCount: 102,
			requestCount: 0,
		},
		{
			image: 'test',
			description: 'adskadjadalsd',
			createdAt: '2009-03-15T13:45:30',
			recipientCount: 0,
			requestCount: 1,
		},
	];

	@Input() text: string;

	loginForm = typedFormGroup()
		.addControl('username', '', [Validators.required, EmailValidator.validEmail])
		.addControl('password', '', Validators.required)
		.addControl('rememberMe', false);
}
