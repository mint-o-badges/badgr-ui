import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'oeb-global-sort-select',
	template: `
		<oeb-select
			actionBar="true"
			class="oeb tw-block tw-w-full"
			[options]="sortOptions"
			[control]="control"
			[disabled]="disabled"
			[autofocus]="true"
			[placeholder]="placeholder"
			noTopMargin="true"
		></oeb-select>
	`,
	standalone: false,
})
export class OebGlobalSortSelectComponent implements OnInit {
	@Input() control: FormControl = new FormControl('name_asc');
	@Input() disabled: boolean = false;
	@Input() placeholder: string | undefined;

	@Output() sortChanged = new EventEmitter<string>();

	sortOptions: Array<{ value: string; label: string }> = [
		{ value: 'name_asc', label: 'A-Z' },
		{ value: 'name_desc', label: 'Z-A' },
		{ value: 'date_asc', label: this.translate.instant('General.dateAscending') },
		{ value: 'date_desc', label: this.translate.instant('General.dateDescending') },
	];

	constructor(private translate: TranslateService) {}

	ngOnInit(): void {
		this.control.valueChanges.subscribe((value) => {
			this.sortChanged.emit(value);
		});
	}

	ngAfterViewInit(): void {
		if (!this.control.value) {
			this.control.setValue('date_desc', { emitEvent: true });
		}
	}
}
