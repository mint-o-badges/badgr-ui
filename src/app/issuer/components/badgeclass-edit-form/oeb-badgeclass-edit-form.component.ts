import { AfterViewInit, Component, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { BadgeClassEditFormComponent } from './badgeclass-edit-form.component';
import { AsyncPipe } from '@angular/common';
import { AUTH_PROVIDER } from '~/common/services/authentication-service';
import { Issuer } from '~/issuer/models/issuer.model';
import { Network } from '~/issuer/network.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BadgeClassSelectTypeComponent } from '../badgeclass-select-type/badgeclass-select-type.component';
import { LearningPathEditFormComponent } from '../learningpath-edit-form/learningpath-edit-form.component';
import { CommonDialogsService } from '~/common/services/common-dialogs.service';
import { ConfirmDialog } from '~/common/dialogs/confirm-dialog.component';
import { NounprojectDialog } from '~/common/dialogs/nounproject-dialog/nounproject-dialog.component';
import { BadgeClass } from '~/issuer/models/badgeclass.model';
import { ApiBadgeClass } from '~/issuer/models/badgeclass-api.model';
import { CommonEntityManager } from '~/entity-manager/services/common-entity-manager.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'oeb-badgeclass-edit-form',
	template: `
		<base [href]="baseurl()" />
		<confirm-dialog #confirmDialog></confirm-dialog>
		<nounproject-dialog #nounprojectDialog></nounproject-dialog>
		@if (authService.isLoggedIn$ | async) {
			@if (config()?.issuer) {
				@switch (currentRoute()) {
					@case ('select') {
						<badgeclass-select-type />
					}
					@case ('create') {
						@if (config().badge) {
							<badgeclass-edit-form
								(save)="onBadgeClassCreated()"
								(cancelEdit)="onCancel()"
								[issuer]="config().issuer"
								[badgeClass]="badge()"
								isForked="false"
							/>
						} @else if (category()) {
							<badgeclass-edit-form
								(save)="onBadgeClassCreated()"
								(cancelEdit)="onCancel()"
								[issuer]="config().issuer"
								[badgeClass]="badge()"
								[category]="category()"
							/>
						}
					}
					@case ('create-lp') {
						<learningpath-edit-form
							(save)="onBadgeClassCreated()"
							(cancelEdit)="onCancel()"
							[issuer]="config().issuer"
						/>
					}
					@case ('finished') {
						<div class="tw-flex tw-items-center tw-gap-[20px] md:tw-w-[530px] tw-w-[98%] tw-p-10">
							<div class="oeb-icon-circle tw-my-6 tw-bg-green tw-w-[60px] tw-h-[60px]">
								<ng-icon hlm class="tw-text-purple tw-font-bold" size="xl" name="lucideCheck" />
							</div>

							<p
								[innerHTML]="
									config().badge
										? ('LearningPath.savedSuccessfully' | translate)
										: ('CreateBadge.successfullyCreated' | translate)
								"
								class="tw-font-normal md:tw-text-[24px] md:tw-leading-[28.8px] tw-text-[16.8px] tw-leading-[px] tw-text-oebblack"
							></p>
						</div>
					}
					@case ('error') {
						<div class="tw-flex tw-items-center tw-gap-[20px] md:tw-w-[530px] tw-w-[98%] tw-p-10">
							<div class="oeb-icon-circle tw-my-6 tw-bg-green tw-w-[60px] tw-h-[60px]">
								<ng-icon hlm class="tw-text-purple tw-font-bold" size="xl" name="lucideAlert" />
							</div>

							<p
								[innerHTML]="'ErrorDialog.title' | translate"
								class="tw-font-normal md:tw-text-[24px] md:tw-leading-[28.8px] tw-text-[16.8px] tw-leading-[px] tw-text-oebblack"
							></p>
							<p
								[innerHTML]="errorContextInfo()"
								class="tw-font-normal md:tw-text-[24px] md:tw-leading-[28.8px] tw-text-[16.8px] tw-leading-[px] tw-text-oebblack"
							></p>
						</div>
					}
					@case ('unknown') {
						<div class="tw-flex tw-items-center tw-gap-[20px] md:tw-w-[530px] tw-w-[98%] tw-p-10">
							<div class="oeb-icon-circle tw-my-6 tw-bg-green tw-w-[60px] tw-h-[60px]">
								<ng-icon hlm class="tw-text-purple tw-font-bold" size="xl" name="lucideCircleAlert" />
							</div>

							<p
								class="tw-font-normal md:tw-text-[24px] md:tw-leading-[28.8px] tw-text-[16.8px] tw-leading-[px] tw-text-oebblack"
							>
								Uh oh! This is not supposed to happen. Something unknown has happened, please report
								this back to us.
							</p>
						</div>
					}
				}
			}
		} @else {
			<div class="tw-flex tw-items-center tw-gap-[20px] md:tw-w-[530px] tw-w-[98%] tw-p-10">
				<div class="oeb-icon-circle tw-my-6 tw-bg-green tw-w-[60px] tw-h-[60px]">
					<ng-icon hlm class="tw-text-purple tw-font-bold" size="xl" name="lucideLock" />
				</div>

				<p
					[innerHTML]="'Profile.loggingIn' | translate"
					class="tw-font-normal md:tw-text-[24px] md:tw-leading-[28.8px] tw-text-[16.8px] tw-leading-[px] tw-text-oebblack"
				></p>
			</div>
		}
	`,
	imports: [
		BadgeClassEditFormComponent,
		AsyncPipe,
		BadgeClassSelectTypeComponent,
		LearningPathEditFormComponent,
		ConfirmDialog,
		NounprojectDialog,
		NgIcon,
		HlmIcon,
		TranslatePipe,
	],
})
export class OebBadgeClassEditForm implements AfterViewInit {
	readonly finished = output<boolean>();
	readonly baseurl = input.required<SafeResourceUrl, string>({
		transform: (url: string | undefined) =>
			url ? this.domSanitizer.bypassSecurityTrustResourceUrl(url) : this.domSanitizer.bypassSecurityTrustHtml(''),
	});
	readonly token = input.required<string>();
	readonly config = input<{ issuer: Issuer | Network; badge: ApiBadgeClass | undefined }>();
	readonly badge = computed(() => {
		if (this.config()?.badge) return new BadgeClass(this.entityManager, this.config().badge);
		else return undefined;
	});
	readonly category = signal<string>('participation');
	readonly errorContextInfo = signal<string>('');
	readonly domSanitizer = inject(DomSanitizer);
	readonly authService = inject(AUTH_PROVIDER);
	readonly commonDialogsService = inject(CommonDialogsService);
	readonly confirmDialog = viewChild.required<ConfirmDialog>('confirmDialog');
	readonly nounprojectDialog = viewChild.required<NounprojectDialog>('nounprojectDialog');
	readonly router = inject(Router);
	readonly activatedRoute = inject(ActivatedRoute);
	readonly entityManager = inject(CommonEntityManager);
	readonly currentRoute = signal<'initial' | 'select' | 'create' | 'create-lp' | 'finished' | 'error' | 'unknown'>(
		'initial',
	);

	private signInEffect = effect(() => {
		const t = this.token();
		if (t === undefined) return;
		(async () => {
			await this.handleSignInWithToken(t);
		})();
	});

	private initialRouteEffect = effect(
		() => {
			if (this.config()) {
				this.activatedRoute.snapshot.params['issuerSlug'] = this.config().issuer.slug;
				this.currentRoute.set(this.config().badge ? 'create' : 'select');
				// Run the initial routing only once -> destroy it here and use manualCleanup
				this.initialRouteEffect.destroy();
			}
		},
		{ manualCleanup: true },
	);

	constructor() {
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				const url = event.url;
				const routeForUrl = (url) => {
					if (url === undefined) return 'initial';
					if (url.toString().indexOf('/badges/select') >= 0) return 'select';
					if (url.toString().indexOf('/badges/create') >= 0) return 'create';
					if (url.toString().indexOf('/learningpaths/create') >= 0) return 'create-lp';
					return 'unknown';
				};
				if (url.toString().indexOf('create/participation') >= 0) this.category.set('participation');
				if (url.toString().indexOf('create/competency') >= 0) this.category.set('competency');
				this.currentRoute.set(routeForUrl(url));
			}
		});
	}

	ngAfterViewInit(): void {
		this.commonDialogsService.init(this.confirmDialog(), undefined, undefined, this.nounprojectDialog());
	}

	async handleSignInWithToken(token: string) {
		try {
			await this.authService.validateToken(token);
		} catch {
			this.currentRoute.set('error');
			this.errorContextInfo.set('AUTH_FAILED');
			this.finished.emit(false);
		}
	}

	onCancel() {
		this.currentRoute.set(this.config()?.badge ? 'create' : 'select');
	}

	onBadgeClassCreated() {
		this.currentRoute.set('finished');
		this.finished.emit(true);
	}
}
