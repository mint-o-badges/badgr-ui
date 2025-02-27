import {AfterViewInit, Component, OnInit, Input} from '@angular/core';
import { typedFormGroup } from '../../../../common/util/typed-forms';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { BadgeClass } from '../../../../issuer/models/badgeclass.model';

@Component({
  selector: 'badgeclass-details',
  templateUrl: './badgeclass-details.component.html'
})

export class BadgeClassDetailsComponent implements OnInit, AfterViewInit {

	@Input() badgeClass: BadgeClass;

	constructor(
		private rootFormGroup: FormGroupDirective,
	) {
	}

	initFormFromExisting(badge: BadgeClass) {
    if (!badge) return;

    // TODO
  }

	detailsForm: FormGroup;

	badgeClassForm = typedFormGroup();

	ngOnInit(): void {
		this.initFormFromExisting(this.badgeClass);
		this.detailsForm = this.rootFormGroup.control
	}

	ngAfterViewInit(): void {

	}

}
