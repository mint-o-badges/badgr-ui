import { Component, computed, effect, inject, input } from '@angular/core';
import { BadgeClassEditFormComponent } from './badgeclass-edit-form.component';
import { AsyncPipe } from '@angular/common';
import { AUTH_PROVIDER } from '~/common/services/authentication-service';
import { Issuer } from '~/issuer/models/issuer.model';
import { Network } from '~/issuer/network.model';
import { Router } from '@angular/router';
import { BadgeClassSelectTypeComponent } from '../badgeclass-select-type/badgeclass-select-type.component';

@Component({
	selector: 'oeb-badgeclass-edit-form',
	template: `
		@if (authService.isLoggedIn$ | async) {
			@switch (currentRoute()) {
				@case ('select') {
					<badgeclass-select-type />
				}
				@case ('create') {
					@if (issuer()) {
						<badgeclass-edit-form [issuer]="issuer()" />
					}
				}
			}
		} @else {
			<p>Handling authentication, please wait.</p>
		}
	`,
	imports: [BadgeClassEditFormComponent, AsyncPipe, BadgeClassSelectTypeComponent],
})
export class OebBadgeClassEditForm {
	readonly token = input.required<string>();
	readonly issuer = input<Issuer | Network>();
	readonly authService = inject(AUTH_PROVIDER);
	readonly router = inject(Router);
	readonly currentRoute = computed(() => {
		const url = this.router.currentNavigation()?.finalUrl;
		console.log(url);
		if (url === undefined) return 'select'; // initial routing state -> select category
		if (url.toString().indexOf('/badges/select')) return 'select';
		if (url.toString().indexOf('/badges/create')) return 'create';
		if (url.toString().indexOf('/learningpaths/create')) return 'create-lp';

		return 'unknown';
	});
	private signInEffect = effect(() => {
		const t = this.token();
		(async () => {
			await this.handleSignInWithToken(t);
		})();
	});

	async handleSignInWithToken(token: string) {
		await this.authService.validateToken(token);
	}
}
