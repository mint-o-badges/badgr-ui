import { CommonModule, formatDate } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Component, input, output, signal, TemplateRef, viewChild } from '@angular/core';
import { HlmTableImports } from './spartan/ui-table-helm/src';
import { BadgeClass } from '../issuer/models/badgeclass.model';
import { OebButtonComponent } from './oeb-button.component';
import { HlmIconModule } from '@spartan-ng/helm/icon';
import { OebTableImports } from './oeb-table';
import {
	ColumnDef,
	createAngularTable,
	FlexRenderDirective,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
} from '@tanstack/angular-table';
import { NgIcon } from '@ng-icons/core';

@Component({
	selector: 'badges-datatable',
	imports: [
		...HlmTableImports,
		...OebTableImports,
		FlexRenderDirective,
		HlmIconModule,
		CommonModule,
		OebButtonComponent,
		TranslateModule,
		RouterModule,
		NgIcon,
	],
	template: `<table hlmTable oeb-table>
			<thead hlmTHead>
				@for (headerRow of badgeTable.getHeaderGroups(); track headerRow.id) {
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
				@for (row of badgeTable.getRowModel().rows; track row.id) {
					<tr hlmTr>
						@for (cell of row.getVisibleCells(); track cell.id) {
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

		<ng-template #translateHeaderIDCellTemplate let-context>
			{{ context.header.id | translate | titlecase }}
		</ng-template>

		<ng-template #badgeCellTemplate let-context>
			<div
				class="tw-flex tw-flex-row tw-gap-2 tw-cursor-pointer"
				(click)="redirectToBadgeDetail.emit({ badge: context.row.original.badge, focusRequests: false })"
			>
				<div>
					<img
						class=""
						src="{{ context.row.original.badge.image }}"
						alt="{{ context.row.original.badge.description }}"
						width="40"
					/>
				</div>
				<p>{{ context.getValue() }}</p>
			</div>
		</ng-template>

		<ng-template #badgeActionsCellTemplate let-context>
			<div class="tw-flex tw-flex-col tw-gap-1 md:tw-gap-2 tw-leading-relaxed">
				@if (
					context.row.original.badge.extension['extensions:CategoryExtension']?.Category !== 'learningpath'
				) {
					<oeb-button
						size="xs"
						width="full_width"
						(click)="directBadgeAward.emit(context.row.original.badge)"
						[text]="'Badge.award' | translate"
					/>
					<oeb-button
						variant="secondary"
						size="xs"
						width="full_width"
						(click)="qrCodeAward.emit(context.row.original.badge)"
						[text]="'QrCode.qrAward' | translate"
					/>
					@if (context.row.original.requestCount > 0) {
						<oeb-button
							variant="green"
							size="xs"
							width="full_width"
							(click)="
								redirectToBadgeDetail.emit({ badge: context.row.original.badge, focusRequests: true })
							"
							[text]="
								context.row.original.requestCount == 1
									? context.row.original.requestCount + ' ' + ('Badge.openRequestsOne' | translate)
									: context.row.original.requestCount + ' ' + ('Badge.openRequests' | translate)
							"
						/>
					}
				}
			</div>
		</ng-template>`,
})
export class DatatableComponent {
	badges = input.required<DatatableBadgeResult[]>();
	directBadgeAward = output<BadgeClass>();
	qrCodeAward = output<BadgeClass>();
	redirectToBadgeDetail = output<{ badge: BadgeClass; focusRequests: boolean }>();
	translateHeaderIDCellTemplate = viewChild.required<TemplateRef<any>>('translateHeaderIDCellTemplate');
	badgeCellTemplate = viewChild.required<TemplateRef<any>>('badgeCellTemplate');
	badgeActionsTemplate = viewChild.required<TemplateRef<any>>('badgeActionsCellTemplate');

	readonly tableSorting = signal<SortingState>([
		{
			id: 'Badge',
			desc: false,
		},
	]);

	private readonly badgeTableColumnDefinition: ColumnDef<DatatableBadgeResult>[] = [
		{
			header: 'Badge',
			accessorFn: (row) => row.badge.name,
			cell: () => this.badgeCellTemplate(),
			sortDescFirst: false,
		},
		{
			id: 'Badge.createdOn',
			header: () => this.translateHeaderIDCellTemplate(),
			accessorFn: (row) => formatDate(row.badge.createdAt, 'dd.MM.yyyy', 'de-DE'),
			cell: (info) => info.getValue(),
		},
		{
			id: 'Badge.multiRecipients',
			header: () => this.translateHeaderIDCellTemplate(),
			accessorFn: (row) => row.badge.recipientCount,
			cell: (info) => info.getValue(),
		},
		{
			id: 'actions',
			cell: (info) => this.badgeActionsTemplate(),
			enableSorting: false,
		},
	];

	badgeTable = createAngularTable(() => ({
		data: this.badges(),
		columns: this.badgeTableColumnDefinition,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting: this.tableSorting(),
		},
		onSortingChange: (updater) =>
			updater instanceof Function ? this.tableSorting.update(updater) : this.tableSorting.set(updater),
		enableSortingRemoval: false, // ensures at least one column is sorted
	}));

	constructor(private translate: TranslateService) {}
}

export interface DatatableBadgeResult {
	badge: BadgeClass;
	requestCount: number;
}
