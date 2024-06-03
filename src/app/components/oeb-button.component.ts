import { Component, Input, input } from '@angular/core';
import { HlmButtonDirective } from './spartan/ui-button-helm/src';

@Component({
  selector: 'oeb-button',
  standalone: true,
  imports: [HlmButtonDirective],
  template: ` <button class="tw-w-full" hlmBtn [disabled]="disabled" [size]="size" [variant]="variant"><ng-content></ng-content></button> `,
})
export class OebButtonComponent {

    @Input() variant: string = 'default'; 
    @Input() size: string = 'default';
    @Input() disabled: boolean = false;
}