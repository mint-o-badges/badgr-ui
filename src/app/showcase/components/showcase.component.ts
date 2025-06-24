import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { EmailValidator } from '../../common/validators/email.validator';

import { typedFormGroup } from '../../common/util/typed-forms';
import { BadgeClass } from '../../issuer/models/badgeclass.model';

@Component({
	selector: 'oeb-showcase',
	templateUrl: './oeb-showcase.component.html',
	standalone: false,
})
export class ShowcaseComponent {
	public badges = [
		{
			requestCount: 10,
			badge: {
				name: 'test',
				image: 'test',
				description: 'adskadjadalsd',
				createdAt: '2009-06-15T13:45:30',
			} as unknown as BadgeClass,
		},
		{
			requestCount: 0,
			badge: {
				name: 'test2323',
				image: 'test2323',
				description: 'adskadjadalsd',
				createdAt: '2009-01-15T13:45:30',
			} as unknown as BadgeClass,
		},
		{
			requestCount: 1,
			badge: {
				image: 'test',
				name: 'test1232354345',
				description: 'adskadjadalsd',
				createdAt: '2009-03-15T13:45:30',
			} as unknown as BadgeClass,
		},
	];

	@Input() text: string;

	loginForm = typedFormGroup()
		.addControl('username', '', [Validators.required, EmailValidator.validEmail])
		.addControl('password', '', Validators.required)
		.addControl('rememberMe', false);
}
