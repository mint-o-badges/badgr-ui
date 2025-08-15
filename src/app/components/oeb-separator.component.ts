import { Component, Input } from '@angular/core';
import { HlmSeparator } from './spartan/ui-separator-helm/src';
import { BrnSeparator } from '@spartan-ng/brain/separator';

@Component({
	selector: 'oeb-separator',
	imports: [HlmSeparator, BrnSeparator],
	template: ` <brn-separator decorative [class]="separatorStyle" hlmSeparator [orientation]="orientation" /> `,
})
export class OebSeparatorComponent {
	@Input() orientation: 'vertical' | 'horizontal' = 'horizontal';
	@Input() separatorStyle: string;
}
