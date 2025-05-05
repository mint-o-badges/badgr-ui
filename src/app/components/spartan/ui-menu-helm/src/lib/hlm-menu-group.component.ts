import { Component } from '@angular/core';
import { BrnMenuGroupDirective } from '@spartan-ng/brain/menu';

@Component({
	selector: 'hlm-menu-group',
	standalone: true,
	host: {
		class: 'tw-block',
	},
	hostDirectives: [BrnMenuGroupDirective],
	template: ` <ng-content /> `,
})
export class HlmMenuGroupComponent {}
