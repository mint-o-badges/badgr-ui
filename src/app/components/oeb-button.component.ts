import { Component, Input } from '@angular/core';
import { HlmButtonDirective } from './spartan/ui-button-helm/src';

@Component({
  selector: 'oeb-button',
  standalone: true,
  imports: [HlmButtonDirective],
  template: ` <button class="tw-w-full" hlmBtn [size]="size" [variant]="variant"><ng-content></ng-content></button> `,
})
export class OebButtonComponent {

    @Input() variant: string = 'default'; 
    @Input() size: string = 'default';
}