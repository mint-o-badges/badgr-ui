import { Component, effect, inject, input } from '@angular/core';
import { SessionService } from '~/common/services/session.service';
import { BadgeClassEditFormComponent } from './badgeclass-edit-form.component';
import { AsyncPipe } from '@angular/common';

@Component({
	selector: 'oeb-badgeclass-edit-form',
	template: `
		@if (sessionService.loggedin$ | async) {
			<badgeclass-edit-form />
		} @else {
			<p>Handling authentication, please wait.</p>
		}
	`,
	imports: [BadgeClassEditFormComponent, AsyncPipe],
})
export class OebBadgeClassEditForm {
	readonly token = input.required<string>();
	readonly sessionService = inject(SessionService);
	private signInEffect = effect(() => {
		const t = this.token();
		(async () => {
			await this.handleSignInWithToken(t);
		})();
	});

	async handleSignInWithToken(token: string) {
		await new Promise((resolve) =>
			window.setTimeout(() => {
				console.log('alarm');
				resolve(null);
			}, 4_000),
		);
	}
}
