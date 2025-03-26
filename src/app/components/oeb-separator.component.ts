import { Component, Input } from '@angular/core';
import { HlmSeparatorDirective } from './spartan/ui-separator-helm/src';
import { BrnSeparatorComponent } from '@spartan-ng/ui-separator-brain';

@Component({
	selector: 'oeb-separator',
	imports: [HlmSeparatorDirective, BrnSeparatorComponent],
	template: ` <brn-separator decorative [class]="separatorStyle" hlmSeparator [orientation]="orientation" /> `,
})
export class OebSeparatorComponent {
	@Input() orientation: 'vertical' | 'horizontal' = 'horizontal';
	@Input() separatorStyle: string;
}
