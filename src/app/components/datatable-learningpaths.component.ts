import { CommonModule, formatDate } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { RouterModule } from '@angular/router';
import { Component, input, output, TemplateRef, viewChild } from '@angular/core';
import { HlmTableImports } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';
import { Issuer } from '../issuer/models/issuer.model';
import { HlmIconModule } from '@spartan-ng/helm/icon';
import { ApiLearningPath } from '~/common/model/learningpath-api.model';
import { PublicApiLearningPath } from '~/public/models/public-api.model';
import { ColumnDef, createAngularTable, FlexRenderDirective, getCoreRowModel } from '@tanstack/angular-table';
import { OebTableImports } from './oeb-table';

@Component({
	selector: 'learningpaths-datatable',
	imports: [
		...HlmTableImports,
		...OebTableImports,
		FlexRenderDirective,
		HlmIconModule,
		CommonModule,
		OebButtonComponent,
		TranslateModule,
		RouterModule,
	],
	template: ` <table hlmTable oeb-table>
			<thead hlmTHead>
				@for (headerRow of badgeTable.getHeaderGroups(); track headerRow.id) {
					<tr hlmTr>
						@for (headerCell of headerRow.headers; track headerCell.id) {
							@if (!headerCell.isPlaceholder) {
								<th hlmTh>
									<ng-container
										*flexRender="
											headerCell.column.columnDef.header;
											props: headerCell.getContext();
											let header
										"
									>
										<div [innerHTML]="header"></div>
									</ng-container>
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
				(click)="onNavigateToDetail.emit(context.row.original.slug)"
			>
				<div>
					<img
						class=""
						src="{{ context.row.original.participationBadge_image }}"
						alt="{{ context.row.original.description }}"
						width="40"
					/>
				</div>
				<p>{{ context.getValue() }}</p>
			</div>
		</ng-template>

		<ng-template #badgeActionsCellTemplate let-context>
			<div class="tw-flex tw-flex-col tw-gap-1 md:tw-gap-2 tw-leading-relaxed">
				<oeb-button
					class="tw-w-full"
					variant="secondary"
					size="xs"
					width="full_width"
					(click)="onDelete.emit(context.row.original.slug)"
					[text]="'General.delete' | translate"
					[disabled]="!issuer().canDeleteBadge"
					[class]="issuer().canDeleteBadge ? '' : 'disabled'"
				/>
			</div>
		</ng-template>`,
})
export class LearningPathDatatableComponent {
	learningPaths = input.required<(ApiLearningPath | PublicApiLearningPath)[]>();
	issuer = input<Issuer | null>(null);
	onDelete = output<string>();
	onNavigateToDetail = output<string>();
	translateHeaderIDCellTemplate = viewChild.required<TemplateRef<any>>('translateHeaderIDCellTemplate');
	badgeCellTemplate = viewChild.required<TemplateRef<any>>('badgeCellTemplate');
	badgeActionsTemplate = viewChild.required<TemplateRef<any>>('badgeActionsCellTemplate');

	private readonly tableColumnDefinition: ColumnDef<ApiLearningPath | PublicApiLearningPath>[] = [
		{
			header: 'Micro Degree',
			accessorFn: (row) => row.name,
			cell: () => this.badgeCellTemplate(),
		},
		{
			id: 'Badge.createdOn',
			header: () => this.translateHeaderIDCellTemplate(),
			accessorFn: (row) => formatDate(row.created_at, 'dd.MM.yyyy', 'de-DE'),
			cell: (info) => info.getValue(),
		},
		{
			id: 'Issuer.learningPathParticipants',
			header: () => this.translateHeaderIDCellTemplate(),
			accessorFn: (row) => row.participant_count,
			cell: (info) => info.getValue(),
		},
		{
			id: 'actions',
			cell: (info) => this.badgeActionsTemplate(),
		},
	];

	badgeTable = createAngularTable(() => ({
		data: this.learningPaths(),
		columns: this.tableColumnDefinition,
		getCoreRowModel: getCoreRowModel(),
	}));

	constructor(private translate: TranslateService) {}
}
