import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LinkEntry } from './bg-breadcrumbs/bg-breadcrumbs.component';
import { VerifyBadgeDialog } from '../../public/components/verify-badge-dialog/verify-badge-dialog.component';

type MenuItem = {
    title: string;
    routerLink?: string[] | string;
    icon: string;
    disabled?: boolean;
    action?: () => void;
};

type HeaderButton = {
    title: string;
    routerLink?: string[];
    disabled?: boolean;
    action?: () => void;
};

export interface PageConfig {
     crumbs?: LinkEntry[] | null;
     badgeTitle: string;
     headerButton?: HeaderButton | null,
     issuerSlug: string;
     slug: string;
     menuitems?: MenuItem[];
     createdAt?: Date;
     updatedAt?: Date;
     issuedOn?: Date;
     issuedTo?: string;
     category: string;
     tags: string[];
     issuerName: string;
     issuerImagePlacholderUrl: string;
     issuerImage: string;
     badgeLoadingImageUrl: string;
     badgeFailedImageUrl: string;
     badgeImage: string;
     badgeDescription: string;
     competencies?: [
        {
            name: string;
            description: string;
            studyLoad: number;
        }
     ];
     datatable?: {
        caption: string;
        recipientCount: number;
        recipients: any[];
        actionElement: any;
     };
}

@Component({
	selector: 'bg-badgedetail',
	template: `
    <ng-template [bgAwaitPromises]="awaitPromises">
        <main class="o-container" *ngIf="config">
        <form-message></form-message>
        <div class="l-containerxaxis">
            
            <div class="tw-flex tw-flex-col tw-relative">
                <div class="badge-header">
                    <h1 class="tw-text-purple tw-max-w-[480px]">{{ config.badgeTitle }}</h1>
                    <div *ngIf="config.headerButton" class="badge-header-btn">
					<a *ngIf="config.headerButton.routerLink"
						class="button tw-w-[305px] md:tw-w-[358px] md:tw-h-[64px] tw-h-[45px] tw-flex tw-items-center tw-justify-center tw-text-xl tw-rounded-[7px]"
						[routerLink]="config.headerButton.routerLink"
						[disabled-when-requesting]="true"
						>{{ config.headerButton.title }}</a
					>
                    <button *ngIf="config.headerButton.action"
                        class="button tw-w-[305px] md:tw-w-[358px] md:tw-h-[64px] tw-h-[45px] tw-flex tw-items-center tw-justify-center tw-text-xl tw-rounded-[7px]"
                        (click)="config.headerButton.action()"
                        [disabled-when-requesting]="true">{{ config.headerButton.title }}</button>

					<button class="threedots threedots-secondary tw-rounded-[7px] tw-w-[44.8px] tw-h-[44.8px] md:tw-w-[64px] md:tw-h-[64px]" id="actionstrigger" [bgPopupMenuTrigger]="moreMenu">
						<svg icon="icon_more"></svg>
						<span class="visuallyhidden">Mehr</span>
					</button>
					<bg-popup-menu #moreMenu>
                    <div *ngFor="let menuitem of config.menuitems">
						<button
							class="menuitem"
							type="button"
							[routerLink]="menuitem.routerLink"
                            (click)="menuitem.action()"
						>
							<svg icon={{menuitem.icon}}></svg>{{ menuitem.title}}
						</button>
                    </div>
					</bg-popup-menu>
				</div>
                </div>
            </div>

            <!-- Sidebar -->

            <div class="tw-flex md:tw-flex-row tw-flex-col tw-mt-4 tw-relative md:tw-mx-0 tw-mx-auto">
				<div class="badge-sidebar">
					<div class="badge-sidebar-internal">
						<div>
							<div class="tw-w-[195px] tw-h-[179px] md:tw-w-[297.86px] md:tw-h-[257px] tw-flex tw-items-center tw-bg-white tw-mx-auto tw-rounded-[20px] tw-border tw-border-solid tw-border-[var(--color-purple)] ">
							<img
								class="badge-image badgeimage-center"
								[loaded-src]="config.badgeImage"
								[loading-src]="config.badgeLoadingImageUrl"
								[error-src]="config.badgeFailedImageUrl"
							/>
							</div>

							<!-- Issuer Information -->

								<div class="l-flex l-flex-2x u-padding-top2x tw-mt-4 md:tw-w-[280px] tw-mx-auto tw-flex tw-items-center tw-border tw-border-solid tw-border-[var(--color-purple)] tw-pl-4 tw-py-4 tw-bg-white tw-rounded-[20px]">
									<div >
										<img class="issuer-image"
											[loaded-src]="config.issuerImage"
											[loading-src]="config.issuerImagePlacholderUrl"
											[error-src]="config.issuerImagePlacholderUrl"
										/>
									</div>
									<div class="tw-text-oebblack">
										<dt class="tw-italic ">{{ 'RecBadgeDetail.issuedBy' | translate }}:</dt>
										<dd class="u-text u-break-word">
												{{config.issuerName}}
										</dd>
									</div>
								</div>
						</div>
						<dl>
							<div class="l-flex l-flex-2x tag-container md:tw-flex-row tw-flex-col">
								<dt class="u-text-small-bold u-text-dark2 md:tw-p-2"> Tags </dt>
								<dd class="u-text">
									<div class="l-tags">
										<div class="tag tw-max-w-24" *ngFor="let tag of config.tags; last as last">{{ tag }}</div>
									</div>
							
							</div>

							<div class="l-flex l-flex-1x tw-text-oebblack u-padding-top2x u-margin-top2x border border-top border-light3 md:tw-flex-row tw-flex-col">
								<dt
									class="u-text-small-bold "
								>
									{{ 'General.category' | translate }}
								</dt>
								<dd class="u-text-small ">{{ config.category }}</dd>
							</div>
							
							<div *ngIf="config.updatedAt" class="l-flex l-flex-1x tw-text-oebblack u-padding-top2x u-margin-top2x border border-top border-light3 md:tw-flex-row tw-flex-col">
								<dt class="u-text-small-bold "
								>
									Zuletzt editiert:
								</dt>
								<dd class="u-text-small"><time [date]="config.updatedAt" format="dd.MM.y"></time></dd>
							</div>
							<div *ngIf="config.createdAt" class="l-flex l-flex-1x tw-text-oebblack u-padding-top2x u-margin-top2x border border-top border-light3 md:tw-flex-row tw-flex-col">
								<dt class="u-text-small-bold "
								>
									Erstellt am:
								</dt>
								<dd class="u-text-small"><time [date]="config.createdAt" format="dd.MM.y"></time></dd>
							</div>
                            <div *ngIf="config.issuedOn" class="l-flex l-flex-1x tw-text-oebblack u-padding-top2x u-margin-top2x border border-top border-light3 md:tw-flex-row tw-flex-col">
								<dt class="u-text-small-bold "
								>
                                    {{ 'RecBadgeDetail.issuedOn' | translate }}
								</dt>
								<dd class="u-text-small"><time [date]="config.issuedOn" format="dd.MM.y"></time></dd>
							</div>
                            <div *ngIf="config.issuedTo" class="l-flex l-flex-1x tw-text-oebblack u-padding-top2x u-margin-top2x border border-top border-light3 md:tw-flex-row tw-flex-col">
                                <dt class="u-text-small-bold "
                                >
                                    Vergeben an:
                                </dt>
                                <dd class="u-text-small u-break-all">{{ config.issuedTo }}</dd>
                            </div>
	
						</dl>

						<hr class="tw-hidden md:tw-block tw-mx-auto tw-w-[280px] tw-col-span-full tw-my-4 tw-border tw-border-solid tw-border-[var(--color-purple)]" />
					</div>
                    </div>
			</div>
            <div class="badge-detail-body">
                <div class="badge-description">
                    <h2 class="tw-text-[22px] tw-leading-[26.4px] tw-font-[500] tw-font-[rubik] tw-text-oebblack u-margin-bottom2x">
                        Kurzbeschreibung
                    </h2>
                    <p class="tw-text-xl tw-font-[rubik] tw-text-oebblack u-text-body u-width-paragraph">{{ config.badgeDescription }}</p>
                </div>
                <!-- Kompetenzen -->
                    <section class="badge-competencies">
                        <h3
                            class="tw-text-[22px] tw-leading-[26.4px] tw-font-[500] tw-font-[rubik] tw-text-oebblack u-margin-bottom2x u-margin-top4x"
                            *ngIf="
                                config.competencies && config.competencies.length > 0
                            "
                        >
                        {{ 'RecBadgeDetail.competencies' | translate }}
                        </h3>
                        <div>
                            <div
                                *ngFor="
                                    let competency of config.competencies;
                                    index as i;
                                "
                            >
                            <competency-accordion [name]="competency.name" [category]="competency.category" [description]="competency.description" [escoID]="competency.escoID" [studyload]="competency.studyLoad | studyload"></competency-accordion>
                            </div>
                        </div>
                    </section>
                    <ng-content></ng-content>
            </div>

        </div>
             



        </main>
        </ng-template>

	`,
})
export class BgBadgeDetail {
    @Input() config: PageConfig;
    @Input() awaitPromises?: Promise<any>[];
}
