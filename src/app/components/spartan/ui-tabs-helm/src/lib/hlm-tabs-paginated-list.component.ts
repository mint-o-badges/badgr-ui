import { CdkObserveContent } from '@angular/cdk/observers';
import { Component, ContentChildren, ElementRef, QueryList, ViewChild, computed, input } from '@angular/core';
import { lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { hlm } from '@spartan-ng/ui-core';
import { HlmIconComponent, provideIcons } from '../../../ui-icon-helm/src';
import { BrnTabsPaginatedListDirective, BrnTabsTriggerDirective } from '@spartan-ng/ui-tabs-brain';
import { ClassValue } from 'clsx';
import { listVariants } from './hlm-tabs-list.component';
import { buttonVariants } from '../../../ui-button-helm/src/lib/hlm-button.directive';

@Component({
    selector: 'hlm-paginated-tabs-list',
    imports: [CdkObserveContent, HlmIconComponent],
    providers: [provideIcons({ lucideChevronRight, lucideChevronLeft })],
    template: `
		<button
			#previousPaginator
			data-pagination="previous"
			type="button"
			aria-hidden="true"
			tabindex="-1"
			[class.tw-flex]="_showPaginationControls()"
			[class.tw-hidden]="!_showPaginationControls()"
			[class]="_paginationButtonClass()"
			[disabled]="_disableScrollBefore || null"
			(click)="_handlePaginatorClick('before')"
			(mousedown)="_handlePaginatorPress('before', $event)"
			(touchend)="_stopInterval()"
		>
			<hlm-icon size="base" name="lucideChevronLeft" />
		</button>

		<div #tabListContainer class="tw-z-[1] tw-flex tw-grow tw-overflow-hidden " (keydown)="_handleKeydown($event)">
			<div class="relative grow transition-transform" #tabList role="tablist" (cdkObserveContent)="_onContentChanges()">
				<div #tabListInner [class]="_tabListClass()">
					<ng-content></ng-content>
				</div>
			</div>
		</div>

		<button
			#nextPaginator
			data-pagination="next"
			type="button"
			aria-hidden="true"
			tabindex="-1"
			[class.tw-flex]="_showPaginationControls()"
			[class.tw-hidden]="!_showPaginationControls()"
			[class]="_paginationButtonClass()"
			[disabled]="_disableScrollAfter || null"
			(click)="_handlePaginatorClick('after')"
			(mousedown)="_handlePaginatorPress('after', $event)"
			(touchend)="_stopInterval()"
		>
			<hlm-icon size="base" name="lucideChevronRight" />
		</button>
	`,
    host: {
        '[class]': '_computedClass()',
    }
})
export class HlmTabsPaginatedListComponent extends BrnTabsPaginatedListDirective {
	@ContentChildren(BrnTabsTriggerDirective, { descendants: false })
	_items!: QueryList<BrnTabsTriggerDirective>;
	@ViewChild('tabListContainer', { static: true })
	_tabListContainer!: ElementRef;
	@ViewChild('tabList', { static: true }) _tabList!: ElementRef;
	@ViewChild('tabListInner', { static: true }) _tabListInner!: ElementRef;
	@ViewChild('nextPaginator') _nextPaginator!: ElementRef<HTMLElement>;
	@ViewChild('previousPaginator') _previousPaginator!: ElementRef<HTMLElement>;

	public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm('tw-flex tw-overflow-hidden tw-relative tw-flex-shrink-0', this.userClass()));

	public readonly tabLisClass = input<ClassValue>('', { alias: 'class' });
	protected _tabListClass = computed(() => hlm(listVariants(), this.tabLisClass()));

	public readonly paginationButtonClass = input<ClassValue>('', { alias: 'class' });
	protected _paginationButtonClass = computed(() =>
		hlm(
			'tw-relative tw-z-[2] tw-select-none data-[pagination=previous]:tw-pr-1 data-[pagination=next]:tw-pl-1 disabled:tw-cursor-default',
			buttonVariants({ variant: 'secondary', size: 'icon' }),
			this.paginationButtonClass(),
		),
	);

	protected _itemSelected(event: KeyboardEvent) {
		event.preventDefault();
	}
}
