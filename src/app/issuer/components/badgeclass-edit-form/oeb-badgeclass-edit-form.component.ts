import { Component, effect, inject, input } from '@angular/core';
import { BadgeClassEditFormComponent } from './badgeclass-edit-form.component';
import { AsyncPipe } from '@angular/common';
import { AUTH_PROVIDER } from '~/common/services/authentication-service';
import { Issuer } from '~/issuer/models/issuer.model';
import { Network } from '~/issuer/network.model';

@Component({
	selector: 'oeb-badgeclass-edit-form',
	template: `
		@if (issuer() && (authService.isLoggedIn$ | async)) {
			<badgeclass-edit-form [issuer]="issuer()" />
		} @else {
			<p>Handling authentication, please wait.</p>
		}
	`,
	imports: [BadgeClassEditFormComponent, AsyncPipe],
})
export class OebBadgeClassEditForm {
	readonly token = input.required<string>();
	readonly issuer = input<Issuer | Network>();
	readonly authService = inject(AUTH_PROVIDER);
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
