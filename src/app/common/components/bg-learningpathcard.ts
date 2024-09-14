import { Component, EventEmitter, Input, HostBinding, Output } from '@angular/core';

type MatchOrProgressType = { match: number } | { progress: number };

@Component({
	selector: 'bg-learningpathcard',
	host: {
		class: 'tw-rounded-[10px] tw-w-[392px] tw-border-solid tw-relative tw-p-6 tw-block tw-overflow-hidden oeb-badge-card',
	},
	template: `
		<a
					[routerLink]="['/public/learningpaths/', slug]">
		<div class="tw-flex tw-flex-col">
				<div class="tw-bg-[var(--color-lightgray)] tw-w-full tw-relative tw-h-[175px] tw-items-center tw-flex tw-justify-center tw-p-2 tw-rounded-[3px]">
				<div *ngIf="!completed" class="tw-bg-[var(--color-purple)] tw-inline-flex tw-rounded-full tw-justify-center tw-items-center tw-p-2 tw-absolute tw-top-0 tw-right-0 tw-mt-1 tw-mr-1">
					<hlm-icon class="tw-text-white" name="lucideRoute" />
                </div>
				<div *ngIf="completed">
					<div class="tw-bg-white tw-inline-flex tw-rounded-full tw-justify-center tw-items-center tw-p-[6px] tw-absolute tw-top-0 tw-right-0 tw-mt-1 tw-mr-1 tw-border-solid tw-border-green tw-border-[3px] ">
						<hlm-icon class="tw-text-purple" name="lucideCheck" />
					</div>
					<div class="tw-bg-[var(--color-purple)] tw-inline-flex tw-rounded-full tw-justify-center tw-items-center tw-p-2 tw-absolute tw-top-0 tw-right-12 tw-mt-1 tw-mr-1">
						<hlm-icon class="tw-text-white" name="lucideRoute" />
					</div>
				</div>
				
					<img
						class="tw-w-[80px] tw-h-[80px]"
						[loaded-src]="badgeImage"
						[loading-src]="badgeLoadingImageUrl"
						[error-src]="badgeFailedImageUrl"
						width="38"
					/>
				</div>
				<div class="tw-flex tw-flex-col tw-flex-wrap tw-py-2 tw-text-oebblack tw-mt-2 tw-gap-1">
					<span
						class="tlew-font-bold tw-text-[22px] tw-leading-[26px]"
						
						>{{ name }}</span>
						<a class="tw-text-[18px] tw-leading-[23.4px]">{{issuerTitle}}</a>
					<div class="tw-grid tw-items-center">
						<div *ngIf="!isProgress" class="oeb-standard-padding-bottom">
							<div  class="tw-bg-white tw-text-purple tw-px-[11.55px] tw-py-[3.85px] tw-rounded-[95px] tw-inline-block tw-border-solid tw-border-[1.59px] tw-border-purple tw-mr-1"
								*ngFor="let tag of tags | slice: 0 : 3; last as last">
								{{ tag }}
							</div>									
						</div>
						<div *ngIf="isMatch; else progressBar">
							<div class="tw-px-[11.55px] tw-py-[3.85px] tw-bg-lightpurple tw-rounded-[95px] tw-max-w-[30%]">
								<span class="tw-text-sm tw-text-purple">{{match.toFixed(0)}}% Match</span> 
							</div>
						</div>	
						<ng-template #progressBar>
							<div *ngIf="progress" class="tw-w-full tw-mt-6 tw-flex tw-justify-center tw-items-center">
								<oeb-progress class="tw-w-full tw-h-6 tw-relative tw-inline-flex tw-overflow-hidden tw-rounded-3xl tw-bg-white tw-items-center" [value]="progress" [template]="progressTemplate"></oeb-progress>
							</div>
						</ng-template>
						<ng-template #progressTemplate>
							<div class="tw-absolute tw-w-full tw-text-left">
								<span class="tw-ml-2 tw-text-sm tw-text-purple">Lernpfad <span *ngIf="!completed">{{progress.toFixed(0)}}%</span> abgeschlossen</span>
							</div>
						</ng-template>	
						<oeb-button *ngIf="isProgress && progress === 100 && !this.completed" [text]="'Lernpfad abholen'" width="full_width">
							
						</oeb-button>
					</div>
					<div class="tw-flex tw-flex-row tw-gap-4 tw-text-[#6B7280] tw-mt-6 tw-items-end">
						<hlm-icon name="lucideClock" />
						<span>{{studyLoad}} Stunden</span>
					</div>
				</div>
					
		</div>
		</a>
	`,
})
export class BgLearningPathCard {
	readonly badgeLoadingImageUrl = '../../../breakdown/static/images/badge-loading.svg';
	readonly badgeFailedImageUrl = '../../../breakdown/static/images/badge-failed.svg';
	private _matchOrProgress: MatchOrProgressType;

	@Input() slug: string;
	@Input() issuerSlug: string;
	@Input() publicUrl: string;
	@Input() badgeImage: string;
	@Input() name: string;
	@Input() description: string;
	@Input() badgeIssueDate: string;
	@Input() badgeClass: string;
	@Input() issuerTitle: string;
	@Input() tags: string[];
	@Input() public = false;
	@Input() studyLoad: number;
	@Input() completed = false;
	@Output() shareClicked = new EventEmitter<MouseEvent>();

	@HostBinding('class') get hostClasses(): string {
		if(this.isProgress && this.progress < 100){
			return 'tw-bg-[var(--color-lightgreen)] tw-border-purple tw-border'
		}
		else if(this.isProgress && this.progress === 100 && !this.completed){
			return 'tw-bg-[var(--color-lightgreen)] tw-border-green tw-border-4'
		}
		else{
			return 'tw-bg-white tw-border-purple tw-border'
		}	
	  } 

	@Input() set matchOrProgress(value: MatchOrProgressType) {
		if ('match' in value && 'progress' in value) {
		  throw new Error('Only one of "match" or "progress" can be set.');
		}
		this._matchOrProgress = value;
	  }
	
	  get isMatch(): boolean {
		return 'match' in this._matchOrProgress;
	  }
	
	  get isProgress(): boolean {
		return 'progress' in this._matchOrProgress;
	  }
	
	  get match(): number | undefined {
		return this.isMatch ? (this._matchOrProgress as { match: number }).match : undefined;
	  }
	
	  get progress(): number | undefined {
		return this.isProgress ? (this._matchOrProgress as { progress: number }).progress : undefined;
	  }
	
}
