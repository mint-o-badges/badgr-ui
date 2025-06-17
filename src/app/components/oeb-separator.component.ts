import { Component, Input } from '@angular/core';
import { BrnSeparatorComponent } from '@spartan-ng/brain/separator';
import { HlmSeparatorDirective } from './spartan/ui-separator-helm/src/lib/hlm-separator.directive';

@Component({
	selector: 'oeb-separator',
	imports: [HlmSeparatorDirective, BrnSeparatorComponent],
	template: ` <brn-separator decorative [class]="separatorStyle" hlmSeparator [orientation]="orientation" /> `,
})
export class OebSeparatorComponent {
	@Input() orientation: 'vertical' | 'horizontal' = 'horizontal';
	@Input() separatorStyle: string;
}
