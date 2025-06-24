import { Component, Input } from '@angular/core';
import { Validators, FormsModule } from '@angular/forms';
import { EmailValidator } from '../../common/validators/email.validator';

import { typedFormGroup } from '../../common/util/typed-forms';
import { HlmH1Directive } from '../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { HlmH2Directive } from '../../components/spartan/ui-typography-helm/src/lib/hlm-h2.directive';
import { HlmH3Directive } from '../../components/spartan/ui-typography-helm/src/lib/hlm-h3.directive';
import { HlmPDirective } from '../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { OebButtonComponent } from '../../components/oeb-button.component';
import { HlmADirective } from '../../components/spartan/ui-typography-helm/src/lib/hlm-a.directive';
import { OebInputComponent } from '../../components/input.component';
import { OebCheckboxComponent } from '../../components/oeb-checkbox.component';
import { DatatableComponent } from '../../components/datatable-badges.component';
import { CompetencyAccordionComponent } from '../../components/accordion.component';
import { OebSpinnerComponent } from '../../components/oeb-spinner.component';
import { BadgeClass } from '../../issuer/models/badgeclass.model';

@Component({
	selector: 'oeb-showcase',
	templateUrl: './oeb-showcase.component.html',
	imports: [
		HlmH1Directive,
		HlmH2Directive,
		HlmH3Directive,
		HlmPDirective,
		OebButtonComponent,
		HlmADirective,
		FormsModule,
		OebInputComponent,
		OebCheckboxComponent,
		DatatableComponent,
		CompetencyAccordionComponent,
		OebSpinnerComponent,
	],
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
