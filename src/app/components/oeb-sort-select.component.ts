import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BadgeResult } from '../recipient/components/recipient-earned-badge-list/recipient-earned-badge-list.component';
import { OebSelectComponent } from './select.component';

@Component({
	selector: 'oeb-sort-select',
	template: `
		<oeb-select
			[actionBar]="true"
			class="oeb tw-block tw-w-full"
			[options]="sortOptions"
			[control]="control"
			[disabled]="disabled"
			[autofocus]="true"
			[placeholder]="placeholder"
			[noTopMargin]="true"
		></oeb-select>
	`,
	imports: [OebSelectComponent],
})
export class OebSortSelectComponent implements OnInit, AfterViewInit {
	@Input() control: FormControl = new FormControl('name_asc');
	@Input() result: BadgeResult[] = [];
	@Input() recipient: boolean = false;
	@Input() learningPath: boolean = false;
	@Input() disabled: boolean = false;
	@Input() placeholder: string | undefined;
	sortOptions: Array<{ value: string; label: string }> = [
		{ value: 'name_asc', label: 'A-Z' },
		{ value: 'name_desc', label: 'Z-A' },
		{ value: 'date_asc', label: this.translate.instant('General.dateAscending') },
		{ value: 'date_desc', label: this.translate.instant('General.dateDescending') },
	];

	constructor(private translate: TranslateService) {}

	ngOnInit(): void {
		this.control.valueChanges.subscribe((value) => {
			this.changeOrder(value);
		});
	}

	ngAfterViewInit(): void {
		// Default order by name ascending
		this.changeOrder('name_asc');
	}

	changeOrder(sortOption: string): void {
		const [sortBy, order] = sortOption.split('_') as ['name' | 'date', 'asc' | 'desc'];
		const multiplier = order === 'asc' ? 1 : -1;

		const sortFn = (a: any, b: any): number => {
			const getFields = (item: any) => {
				if (this.recipient) {
					return {
						name: item.badge.apiModel.json.badge.name,
						createdOn: new Date(item.badge.apiModel.json.issuedOn).getTime(),
					};
				}
				if (this.learningPath) {
					return {
						name: item.name,
						createdOn: new Date(item.apiModel.created_at).getTime(),
					};
				}
				return {
					name: item.name,
					createdOn: new Date(item.createdAt).getTime(),
				};
			};

			const { name: nameA, createdOn: createdOnA } = getFields(a);
			const { name: nameB, createdOn: createdOnB } = getFields(b);

			if (sortBy === 'name') {
				return multiplier * nameA.localeCompare(nameB);
			}
			if (sortBy === 'date') {
				return multiplier * (createdOnA - createdOnB);
			}

			return 0;
		};

		this.result.sort(sortFn);
	}
}
