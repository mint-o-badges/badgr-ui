import { AfterViewInit, Component, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { BadgeClassEditFormComponent } from './badgeclass-edit-form.component';
import { AsyncPipe } from '@angular/common';
import { AUTH_PROVIDER } from '~/common/services/authentication-service';
import { Issuer } from '~/issuer/models/issuer.model';
import { Network } from '~/issuer/network.model';
import { ActivatedRoute, NavigationEnd, Router, RouterStateSnapshot } from '@angular/router';
import { BadgeClassSelectTypeComponent } from '../badgeclass-select-type/badgeclass-select-type.component';
import { LearningPathEditFormComponent } from '../learningpath-edit-form/learningpath-edit-form.component';
import { CommonDialogsService } from '~/common/services/common-dialogs.service';
import { ConfirmDialog } from '~/common/dialogs/confirm-dialog.component';
import { NounprojectDialog } from '~/common/dialogs/nounproject-dialog/nounproject-dialog.component';

@Component({
	selector: 'oeb-badgeclass-edit-form',
	template: `
		<confirm-dialog #confirmDialog></confirm-dialog>
		<nounproject-dialog #nounprojectDialog></nounproject-dialog>
		@if (authService.isLoggedIn$ | async) {
			@switch (currentRoute()) {
				@case ('select') {
					<badgeclass-select-type />
				}
				@case ('create') {
					@if (issuer() && category()) {
						<badgeclass-edit-form
							(save)="onBadgeClassCreated()"
							(cancelEdit)="onCancel()"
							[issuer]="issuer()"
							[category]="category()"
							[isForked]="false"
							[initBadgeClass]="null"
						/>
					}
				}
				@case ('create-lp') {
					@if (issuer()) {
						<learningpath-edit-form
							(save)="onBadgeClassCreated()"
							(cancelEdit)="onCancel()"
							[issuer]="issuer()"
						/>
					}
				}
				@case ('finished') {
					<p>Finished creating the badge</p>
				}
				@case ('unknown') {
					<p>Unknown Operation</p>
				}
			}
		} @else {
			<p>Handling authentication, please wait.</p>
		}
	`,
	imports: [
		BadgeClassEditFormComponent,
		AsyncPipe,
		BadgeClassSelectTypeComponent,
		LearningPathEditFormComponent,
		ConfirmDialog,
		NounprojectDialog,
	],
})
export class OebBadgeClassEditForm implements AfterViewInit {
	readonly finished = output<boolean>();
	readonly token = input.required<string>();
	readonly issuer = input<Issuer | Network>();
	readonly category = signal<string>('participation');
	readonly authService = inject(AUTH_PROVIDER);
	readonly commonDialogsService = inject(CommonDialogsService);
	readonly confirmDialog = viewChild.required<ConfirmDialog>('confirmDialog');
	readonly nounprojectDialog = viewChild.required<NounprojectDialog>('nounprojectDialog');
	readonly router = inject(Router);
	readonly activatedRoute = inject(ActivatedRoute);
	readonly currentRoute = signal<'initial' | 'select' | 'create' | 'create-lp' | 'finished' | 'unknown'>('select');

	private signInEffect = effect(() => {
		const t = this.token();
		(async () => {
			await this.handleSignInWithToken(t);
		})();
	});
	private initialRouteEffect = effect(
		() => {
			if (this.issuer()) {
				this.activatedRoute.snapshot.params['issuerSlug'] = this.issuer().slug;

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
			this.finished.emit(false);
		}
	}

	onCancel() {
		this.currentRoute.set('select');
	}

	onBadgeClassCreated() {
		this.currentRoute.set('finished');
		this.finished.emit(true);
	}
}
