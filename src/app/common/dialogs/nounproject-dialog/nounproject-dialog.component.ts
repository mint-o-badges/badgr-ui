import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { AppConfigService } from '../../app-config.service';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { BaseDialog } from '../base-dialog';
import { NounprojectService } from '../../services/nounproject.service';
import { NounProjectIcon } from '../../model/nounproject.model';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'nounproject-dialog',
    templateUrl: 'nounproject-dialog.component.html',
    styleUrls: ['./nounproject-dialog.component.css'],
    standalone: false
})
export class NounprojectDialog extends BaseDialog implements AfterViewInit {
	Array = Array;
	resolveFunc: (BadgeClass) => void;
	rejectFunc: () => void;

	icons: any[] = null;
	maxDisplayedResults = 10;
	order = 'asc';

	iconsLoaded: Promise<unknown>;
	searchTerm: string = '';
	page: number = 1;
	endOfResults: boolean = false;
	loadingMore: boolean = false;
	noResult: boolean = false;

	private _searchQuery = '';
	get searchQuery() {
		return this._searchQuery;
	}
	set searchQuery(query) {
		this._searchQuery = query;
		this.searchIcons(query);
	}

	@ViewChild('nounprojectSearch') searchbar: ElementRef;

	constructor(
		protected messageService: MessageService,
		protected configService: AppConfigService,
		componentElem: ElementRef<HTMLElement>,
		protected nounprojectService: NounprojectService,
		renderer: Renderer2,
	) {
		super(componentElem, renderer);
	}

	ngAfterViewInit(): void {
		// debounce the input to prevent spamming of requests
		fromEvent(this.searchbar.nativeElement, 'input')
			.pipe(map((event: Event) => (event.target as HTMLInputElement).value))
			.pipe(debounceTime(300))
			.pipe(distinctUntilChanged())
			.subscribe((searchTerm) => {
				this.searchIcons(searchTerm);
			});
	}

	async openDialog(): Promise<NounProjectIcon> {
		this.showModal();

		return new Promise<NounProjectIcon>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	searchIcons(searchTerm: string) {
		this.searchTerm = searchTerm;
		this.icons = [];
		this.page = 1;
		this.endOfResults = false;
		this.loadingMore = false;
		if (searchTerm.length > 0) {
			// promise for the loading spinner
			this.iconsLoaded = new Promise((resolve, reject) => {
				this.nounprojectService
					.getNounProjectIcons(searchTerm, this.page)
					.then((results) => {
						this.noResult = true;
						// To prevent older requests, which took longer to load, from overwriting current results
						if (searchTerm == this.searchTerm) {
							// combine all slugs to one string (maybe this could be done in the html?)
							results.forEach((result) => {
								let tag_slugs = '';
								result.tags.forEach((tag) => {
									if (tag.slug != searchTerm) {
										if (tag_slugs != '') tag_slugs += ', ';
										tag_slugs += tag.slug;
									}
								});
								result.tag_slugs = tag_slugs;
							});
							this.icons = results;
							if (results.length < 10) {
								// currently we only request 10 at a time, but this could be changed in the server
								this.endOfResults = true;
							}
						}
						resolve(results);
					})
					.catch((error) => {
						if (searchTerm == this.searchTerm) {
							// show the no results error
							this.noResult = true;
							this.messageService.reportAndThrowError(
								'No results for this request from nounproject.',
								error,
							);
						}
						resolve([]);
					});
			});
		} else {
			this.iconsLoaded = undefined;
		}
	}

	closeDialog() {
		this.closeModal();
		this.resolveFunc(undefined);
	}

	selectIcon(icon: NounProjectIcon) {
		this.closeModal();
		this.resolveFunc(icon);
	}

	loadMoreIcons() {
		this.loadingMore = true;
		this.page++;
		if (this.searchTerm.length > 0) {
			// promise for the loading spinner
			new Promise((resolve, reject) => {
				this.nounprojectService
					.getNounProjectIcons(this.searchTerm, this.page)
					.then((results) => {
						this.noResult = true;
						// combine all slugs to one string (maybe this could be done in the html?)
						results.forEach((result) => {
							let tag_slugs = '';
							result.tags.forEach((tag) => {
								if (tag.slug != this.searchTerm) {
									if (tag_slugs != '') tag_slugs += ', ';
									tag_slugs += tag.slug;
								}
							});
							result.tag_slugs = tag_slugs;
						});
						this.loadingMore = false;
						this.icons.push.apply(this.icons, results);
						if (results.length < 10) {
							// currently we only request 10 at a time, but this could be changed in the server
							this.endOfResults = true;
						}
						resolve(results);
					})
					.catch((error) => {
						this.endOfResults = true;
						this.loadingMore = false;
						this.messageService.reportAndThrowError('No results for this request from nounproject.', error);
					});
			});
		} else {
			this.iconsLoaded = undefined;
		}
	}
}
