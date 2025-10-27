import { Component, OnInit, Input, inject } from '@angular/core';
import { typedFormGroup } from '../../../../common/util/typed-forms';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { BadgeClass } from '../../../../issuer/models/badgeclass.model';

@Component({
	selector: 'badgeclass-details',
	templateUrl: './badgeclass-details.component.html',
})
export class BadgeClassDetailsComponent implements OnInit {
	private rootFormGroup = inject(FormGroupDirective);

	@Input() badgeClass: BadgeClass;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	initFormFromExisting(badge: BadgeClass) {
		if (!badge) return;

		// TODO
	}

	detailsForm: FormGroup;

	badgeClassForm = typedFormGroup();

	ngOnInit(): void {
		this.initFormFromExisting(this.badgeClass);
		this.detailsForm = this.rootFormGroup.control;
	}
}
