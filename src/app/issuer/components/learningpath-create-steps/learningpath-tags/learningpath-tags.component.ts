import { Component, ElementRef, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormFieldSelectOption } from '../../../../common/components/formfield-select';
import { LearningPathManager } from '../../../../issuer/services/learningpath-manager.service';
import { LearningPath } from '../../../../issuer/models/learningpath.model';
import { ApiLearningPath } from '../../../../common/model/learningpath-api.model';

@Component({
	selector: 'learningpath-tags',
	templateUrl: './learningpath-tags.component.html',
	styleUrls: ['../../learningpath-edit-form/learningpath-edit-form.component.scss'],
	standalone: false,
})
export class LearningPathTagsComponent implements OnInit {
	@Input() lpName: string;
	@Input() lpDescription: string;
	@Input() lpImage: string;

	@Input()
	set learningPath(lp: ApiLearningPath) {
		lp.tags.forEach((t) => {
			this.lpTags.add(t);
		});
		this.tagsChanged.emit(Array.from(this.lpTags));
	}

	@Output() tagsChanged = new EventEmitter<string[]>();

	@ViewChild('newTagInput')
	newTagInput: ElementRef<HTMLInputElement>;

	constructor(protected learningPathManager: LearningPathManager) {}
	ngOnInit(): void {
		this.fetchTags();
	}
	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';

	/**
	 * Indicates wether the existing tags are currently being loaded.
	 * It is set in @see fetchTags
	 */
	existingTagsLoading: boolean;

	/**
	 * The already existing tags for other badges, for the autocomplete to show.
	 * The tags are loaded in @see fetchTags
	 */
	existingTags: { id: number; name: string }[];

	tagOptions: FormFieldSelectOption[];

	lpTags = new Set<string>();

	/**
	 * Fetches the tags from the @see badgeClassManager and selects the tags from them.
	 * The tags are then assigned to @see existingTags in an appropriate format.
	 * At the beginning, @see existingTagsLoading is set, once tags are loaded it's unset.
	 */
	fetchTags() {
		this.existingTags = [];
		this.existingTagsLoading = true;
		// outerThis is needed because inside the observable, `this` is something else
		let outerThis = this;
		let observable = this.learningPathManager.allLearningPaths$;

		observable.subscribe({
			next(entities: LearningPath[]) {
				let tags: string[] = entities.flatMap((entity) => entity.tags);
				let unique = [...new Set(tags)];
				unique.sort();
				outerThis.existingTags = unique.map((tag, index) => ({
					id: index,
					name: tag,
				}));
				outerThis.tagOptions = outerThis.existingTags.map(
					(tag) =>
						({
							value: tag.name,
							label: tag.name,
						}) as FormFieldSelectOption,
				);
				// The tags are loaded in one badge, so it's save to assume
				// that after the first `next` call, the loading is done
				outerThis.existingTagsLoading = false;
			},
			error(err) {
				console.error("Couldn't fetch labels: " + err);
			},
		});
	}

	addTag() {
		const newTag = (this.newTagInput['query'] || '').trim().toLowerCase();

		if (newTag.length > 0) {
			this.lpTags.add(newTag);

			this.newTagInput['query'] = '';
		}
		this.tagsChanged.emit(Array.from(this.lpTags));
	}

	handleTagInputKeyPress(event: KeyboardEvent) {
		if (event.keyCode === 13 /* Enter */) {
			this.addTag();
			this.newTagInput.nativeElement.focus();
			event.preventDefault();
		}
	}

	removeTag(tag: string) {
		this.lpTags.delete(tag);
		this.tagsChanged.emit(Array.from(this.lpTags));
	}
}
