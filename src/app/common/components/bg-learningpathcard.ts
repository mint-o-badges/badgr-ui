import { Component, EventEmitter, Input, HostBinding, Output } from '@angular/core';
import { LearningPathApiService } from '../services/learningpath-api.service';

type MatchOrProgressType = { match?: string, progress?: number };

@Component({
	selector: 'bg-learningpathcard',
	host: {
		class: 'tw-rounded-[10px] tw-w-[255px] md:tw-w-[392px] tw-border-solid tw-relative tw-p-4 md:tw-p-6 tw-block tw-overflow-hidden oeb-badge-card',
	},
	template: `
		<a [routerLink]="['/public/learningpaths/', slug]">
			<div class="tw-flex tw-flex-col tw-justify-between tw-h-full">
				<div class="tw-bg-[var(--color-lightgray)] tw-w-full tw-relative md:tw-h-[175px] tw-h-[100px] tw-items-center tw-flex tw-justify-center tw-p-2 tw-rounded-[3px]">
				<div *ngIf="!completed" class="tw-absolute tw-top-[10px] tw-right-[10px]">
					<img src="/assets/oeb/images/learningPath/learningPathIcon.svg" class="md:tw-w-[30px] tw-w-[20px]"
						alt="LearningPath" />
				</div>
				<div *ngIf="completed" class="tw-absolute tw-top-[10px] tw-right-[10px] tw-flex tw-justify-center tw-items-center tw-gap-2">
					<div class="tw-inline-block">
						<img src="/assets/oeb/images/learningPath/learningPathIcon.svg" class="md:tw-w-[30px] tw-w-[20px]"
							alt="LearningPath" />
					</div>
					<div class="tw-bg-white tw-inline-flex tw-rounded-full tw-justify-center tw-items-center tw-border-solid tw-border-green tw-border-[3px] ">
						<hlm-icon class="tw-text-purple tw-box-border md:tw-w-[26px] tw-w-[16px] md:tw-h-[26px] tw-h-[16px]" name="lucideCheck" />
					</div>
				</div>
				
					<img
						class="md:tw-w-[145px] md:tw-h-[145px] tw-w-[65px] tw-h-[65px]"
						[loaded-src]="badgeImage"
						[loading-src]="badgeLoadingImageUrl"
						[error-src]="badgeFailedImageUrl"
						width="38"
					/>
				</div>
				<div class="tw-flex tw-flex-col tw-flex-wrap tw-py-2 tw-text-oebblack tw-mt-2 tw-gap-1">
					<span
						class="tw-font-semibold tw-text-xs md:tw-text-[22px] md:tw-leading-[26px]"
						
						>{{ name }}</span>
						<a class="md:tw-text-[18px] md:tw-leading-[23.4px] tw-text-[10px] tw-leading-[13px]">{{issuerTitle}}</a>
					<div class="tw-grid tw-items-center">
						<div *ngIf="!isProgress" class="oeb-standard-padding-bottom tw-gap-1 tw-flex tw-flex-wrap">
							<div hlmP size="sm" class="oeb-tag"
								*ngFor="let tag of tags | slice: 0 : 3; last as last">
								{{ tag }}
							</div>									
						</div>
						<div *ngIf="isMatch; else progressBar">
							<div class="tw-px-[11.55px] tw-py-[3.85px] tw-bg-lightpurple tw-rounded-[95px] tw-inline-block">
								<span class="tw-text-sm tw-text-purple">{{this._matchOrProgress?.match}} Badges</span> 
							</div>
						</div>	
						<ng-template #progressBar>
							<div *ngIf="progress === 0 || progress" class="tw-mb-4 tw-w-full tw-mt-2 md:tw-mt-6 tw-flex tw-justify-center tw-items-center">
								<oeb-progress class="tw-w-full tw-h-5 md:tw-h-7 tw-relative tw-inline-flex tw-overflow-hidden tw-rounded-3xl tw-bg-white tw-items-center" [value]="(progress/studyLoad*100).toFixed(0)" [template]="requested ? requestedTemplate : progressTemplate"></oeb-progress>
							</div>
						</ng-template>
						<ng-template #progressTemplate>
							<div class="tw-absolute tw-w-full tw-text-left">
								<span class="tw-ml-2 md:tw-text-sm tw-text-[8px] tw-text-purple">Lernpfad <span *ngIf="!completed">{{(progress/studyLoad*100).toFixed(0)}}%</span> abgeschlossen</span>
							</div>
						</ng-template>	
						<ng-template #requestedTemplate>
							<div class="tw-absolute tw-w-full tw-text-left tw-flex tw-items-center">
								<span class="tw-bg-purple tw-rounded-[50%] tw-h-[20px] tw-w-[20px] tw-ml-2">
									<hlm-icon variant="sm" class="tw-text-white tw-box-border" name="lucideCheck" />
								</span>
								<span class="tw-ml-2 md:tw-text-sm tw-text-[8px] tw-text-purple">{{'LearningPath.successRequestPath' | translate}}</span>
							</div>
						</ng-template>	
						<oeb-button *ngIf="isProgress && progress/studyLoad === 1 && !completed && !requested" (click)="requestLearningPath()" [text]="'Lernpfad abholen'" width="full_width">							
						</oeb-button>
					</div>
					<div class="tw-flex tw-flex-row tw-gap-4 tw-text-[#6B7280] md:tw-text-sm tw-text-[8px] tw-mt-2 md:tw-mt-6 tw-items-end">
						<hlm-icon name="lucideClock" />
						<span>{{studyLoad | hourPipe}} Stunden</span>
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

	constructor(private learningPathApiService: LearningPathApiService) {}

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
	@Input() public: boolean = false;
	@Input() studyLoad: number;
	@Input() completed: boolean = false;
	@Input() requested: boolean = false;
	@Input() progress: number | null = null;
	@Input() match: string | null = null;
	@Output() shareClicked = new EventEmitter<MouseEvent>();

	@HostBinding('class') get hostClasses(): string {
		if(this.isProgress && this.progress/this.studyLoad < 1){
			return 'tw-bg-[var(--color-lightgreen)] tw-border-purple tw-border'
		}
		else if(this.isProgress && this.progress/this.studyLoad === 1 && !this.completed){
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
	
	  get isMatch(): (string | undefined) {
		return this._matchOrProgress.match;
	  }
	
	  get isProgress(): boolean {
		return this.progress !== null;
	  }
	
	  requestLearningPath() {
		this.learningPathApiService.requestLearningPath(this.slug).then(res => {
			this.requested = true;
		})
	  }
}
