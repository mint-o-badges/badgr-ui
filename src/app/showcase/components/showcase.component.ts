import { Component, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EmailValidator } from '../../common/validators/email.validator';

import { typedFormGroup } from '../../common/util/typed-forms';
import { MenuItem } from '../../common/components/badge-detail/badge-detail.component.types';

@Component({
	selector: 'oeb-showcase',
	templateUrl: './oeb-showcase.component.html',
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
		},
		{
			image: 'test',
			description: 'adskadjadalsd',
			createdAt: '2009-03-15T13:45:30',
			recipientCount: 0,
		},
	];

	aboutBadgesMenuItems: MenuItem[] = [
		{
			title: 'FAQ',
			routerLink: ['/public/faq'],
			icon: 'lucideFileQuestion',
		},
		{
			title: 'Badges A-Z',
			routerLink: ['/catalog/badges'],
			icon: 'lucideAward',
		},
		{
			title: 'Issuer A-Z',
			routerLink: ['/catalog/issuers'],
			icon: 'lucideWarehouse',
		},
		{
			title: 'Learningpath A-Z',
			routerLink: ['/catalog/learningpaths'],
			icon: 'lucideRoute',
		},
	];

	categoryControl = new FormControl('');
	categoryOptions = [
		{
			label: 'Schule',
			value: 'schule',
		},
		{
			label: 'Hochschule ',
			value: 'hochschule',
		},
		{
			label: 'Andere',
			value: 'andere',
		},
	];

	@Input() text: string;

	loginForm = typedFormGroup()
		.addControl('username', '', [Validators.required, EmailValidator.validEmail])
		.addControl('password', '', Validators.required)
		.addControl('rememberMe', false);
}
