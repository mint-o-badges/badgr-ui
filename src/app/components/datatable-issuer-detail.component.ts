import { CommonModule, formatDate } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Component, input, output, signal, TemplateRef, viewChild } from '@angular/core';
import { HlmTableImports } from './spartan/ui-table-helm/src';
import { BadgeInstance } from '../issuer/models/badgeinstance.model';
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

@Component({
	selector: 'issuer-detail-datatable',
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
		<div class="tw-p-[calc(var(--gridspacing)*2)] tw-mt-8">
			<div class="tw-flex tw-items-center tw-justify-between tw-gap-4 sm:flex-col">
				<div class="l-stack u-margin-bottom2x u-margin-top4x">
					<h3
						class="md:tw-text-xl md:tw-text-nowrap tw-text-sm tw-font-semibold tw-font-[rubik] tw-text-oebblack"
					>
						{{ recipientCount() }} Badge
						{{
							recipientCount() == 1 ? ('Issuer.recipient' | translate) : ('Issuer.recipients' | translate)
						}}
					</h3>
				</div>
			</div>
			@if (awardInProgress()) {
				<div
					class="tw-border-green tw-p-2 tw-border-solid tw-border-4 tw-rounded-[10px] tw-w-full tw-flex md:tw-gap-6 tw-gap-2 tw-items-center"
				>
					<oeb-spinner size="lg"></oeb-spinner>
					<div class="tw-text-oebblack tw-text-lg tw-flex tw-flex-col tw-gap-1">
						<span class="tw-text-lg tw-font-bold tw-uppercase">{{
							'Badge.awardingInProgress' | translate
						}}</span>
						<span>{{ 'Badge.willBeAwardedSoon' | translate }}</span>
					</div>
				</div>
			}
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
						@if (downloadStates()[i]) {
							<td hlmTd [colSpan]="3">
								<loading-dots [showLoading]="false" />
							</td>
						} @else {
							@for (cell of row.getVisibleCells(); track cell.id;) {
								<td hlmTd>
									<ng-container
										*flexRender="cell.column.columnDef.cell; props: cell.getContext(); let cell"
									>
										<div [innerHTML]="cell"></div>
									</ng-container>
								</td>
							}
						}
					</tr>
				}
			</tbody>
			</table>
		</div>

		<ng-template #translateHeaderIDCellTemplate let-context>
			{{ context.header.id | translate | titlecase }}
		</ng-template>

		<ng-template #badgeActionsCellTemplate let-context>
			<div class="tw-flex tw-flex-col tw-gap-1 md:tw-gap-2 tw-leading-relaxed">
				<oeb-button
					size="xs"
					width="full_width"
					(click)="downloadCertificate.emit({ instance: context.row.original, badgeIndex: context.row.index })"
					text="{{ 'Issuer.pdfCertificate' | translate }}"
					[disabled]="downloadStates()[context.row.index]" />
				<oeb-button
					variant="secondary"
					size="xs"
					width="full_width"
					(click)="actionElement.emit(context.row.original)"
					[text]="'General.revoke' | translate | titlecase" />
			</div>
		</ng-template>
	`,
})
export class IssuerDetailDatatableComponent {
	recipientCount = input<number>(0);
	downloadStates = input<boolean[]>([]);
	awardInProgress = input<boolean>(false);
	recipients = input.required<BadgeInstance[]>();
	actionElement = output<BadgeInstance>();
	downloadCertificate = output<{ instance: BadgeInstance; badgeIndex: number }>();

	translateHeaderIDCellTemplate = viewChild.required<TemplateRef<any>>('translateHeaderIDCellTemplate');
	badgeActionsTemplate = viewChild.required<TemplateRef<any>>('badgeActionsCellTemplate');

	readonly tableSorting = signal<SortingState>([
		{
			id: 'General.name',
			desc: false,
		},
	]);

	private readonly tableColumnDefinition: ColumnDef<BadgeInstance>[] = [
		{
			id: 'General.name',
			header: () => this.translateHeaderIDCellTemplate(),
			accessorFn: (row) => row.recipientIdentifier,
			cell: (ctx) => ctx.getValue(),
			sortDescFirst: false,
		},
		{
			id: 'RecBadgeDetail.issuedOn',
			header: () => this.translateHeaderIDCellTemplate(),
			accessorFn: (row) => formatDate(row.issuedOn, 'dd.MM.yyyy', 'de-DE'),
			cell: (info) => info.getValue(),
		},
		{
			id: 'actions',
			cell: (info) => this.badgeActionsTemplate(),
			enableSorting: false,
		},
	];

	table = createAngularTable(() => ({
		data: this.recipients(),
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
}
