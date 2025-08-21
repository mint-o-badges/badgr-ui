import { CommonModule, formatDate } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Component, input, output, signal, TemplateRef, viewChild } from '@angular/core';
import { HlmTableImports } from './spartan/ui-table-helm/src';
import { FormsModule } from '@angular/forms';
import { lucideSearch } from '@ng-icons/lucide';
import { OebButtonComponent } from './oeb-button.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { OebSpinnerComponent } from './oeb-spinner.component';
import { LoadingDotsComponent } from '../common/components/loading-dots.component';
import { OebTableImports } from './oeb-table';
import {
	ColumnDef,
	createAngularTable,
	FlexRenderDirective,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
} from '@tanstack/angular-table';
import { HlmIconModule } from '@spartan-ng/helm/icon';
import { Issuer } from '../issuer/models/issuer.model';

@Component({
	selector: 'network-partners-datatable',
	imports: [
		FormsModule,
		...HlmTableImports,
		...OebTableImports,
		CommonModule,
		TranslateModule,
		RouterModule,
		OebButtonComponent,
		OebSpinnerComponent,
		LoadingDotsComponent,
		FlexRenderDirective,
		NgIcon,
		HlmIconModule,
	],
	providers: [provideIcons({ lucideSearch })],
	template: `
		<div class="tw-mt-8">
			<table
				hlmTable
				oeb-table
			>
				<thead hlmTHead>
					@for (headerRow of table.getHeaderGroups(); track headerRow.id) {
						<tr hlmTr>
							@for (headerCell of headerRow.headers; track headerCell.id) {
								@if (!headerCell.isPlaceholder) {
									<th hlmTh>
										<div
											class="tw-flex tw-flex-row tw-items-center tw-gap-2 [&[data-sortable='true']]:tw-cursor-pointer"
											(click)="headerCell.column.toggleSorting()"
											[attr.data-sortable]="headerCell.column.getCanSort()"
										>
											<div>
												<ng-container
													*flexRender="
														headerCell.column.columnDef.header;
														props: headerCell.getContext();
														let header
													"
												>
													<div [innerHTML]="header"></div>
												</ng-container>
											</div>

											@if (headerCell.column.getIsSorted()) {
												@let order = headerCell.column.getNextSortingOrder() === "asc" ? "desc" : "asc";
												@if (order === 'asc') {
													<ng-icon hlm size="base" name="lucideChevronUp" />
												} @else {
													<ng-icon hlm size="base" name="lucideChevronDown" />
												}
											} @else if (headerCell.column.getCanSort()) {
												<ng-icon hlm size="base" name="lucideChevronsUpDown" />
											}
										</div>
									</th>
								}
							}
						</tr>
					}
				</thead>
				<tbody hlmTBody>
					@for (row of table.getRowModel().rows; track row.id; let i = $index) {
						<tr hlmTr>
								@for (cell of row.getVisibleCells(); track cell.id;) {
									<td hlmTd>
										<ng-container
											*flexRender="cell.column.columnDef.cell; props: cell.getContext(); let cell"
										>
											<div [innerHTML]="cell"></div>
										</ng-container>
									</td>
								}
						</tr>
					}
				</tbody>
			</table>
		</div>

		<ng-template #translateHeaderIDCellTemplate let-context>
			{{ context.header.id | translate | titlecase }}
		</ng-template>

		<ng-template #issuerActionsCellTemplate let-context>
				<oeb-button
				  class="tw-float-right"
					size="xs"
					variant="secondary"
					(click)="removePartner(context.issuer)"
					text="{{ 'General.remove' | translate }}"
					/>
		</ng-template>
	`,
})
export class NetworkPartnersDatatableComponent {
	partners = input.required<Issuer[]>();
	actionElement = output<Issuer>();

	translateHeaderIDCellTemplate = viewChild.required<TemplateRef<any>>('translateHeaderIDCellTemplate');
	issuerActionsTemplate = viewChild.required<TemplateRef<any>>('issuerActionsCellTemplate');

	readonly tableSorting = signal<SortingState>([
		{
			id: 'General.name',
			desc: false,
		},
	]);

	private readonly tableColumnDefinition: ColumnDef<Issuer>[] = [
		{
			id: 'General.name',
			header: () => this.translateHeaderIDCellTemplate(),
			accessorFn: (row) => row.name,
			cell: (ctx) => ctx.getValue(),
			sortDescFirst: false,
		},
		{
			id: 'RecBadgeDetail.issuedOn',
			header: () => this.translateHeaderIDCellTemplate(),
			accessorFn: (row) => formatDate(row.createdAt, 'dd.MM.yyyy', 'de-DE'),
			cell: (info) => info.getValue(),
		},
		{
			id: 'actions',
			cell: (issuer) => this.issuerActionsTemplate(),
			enableSorting: false,
		},
	];

	table = createAngularTable(() => ({
		data: this.partners(),
		columns: this.tableColumnDefinition,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting: this.tableSorting(),
		},
		onSortingChange: (updater) =>
			updater instanceof Function ? this.tableSorting.update(updater) : this.tableSorting.set(updater),
		enableSortingRemoval: false, // ensures at least one column is sorted
	}));

	constructor() {}

	removePartner(issuer: Issuer) {
		console.log('remove', issuer);
	}
}
