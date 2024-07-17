import { Component, Input, input } from '@angular/core';
import { HlmButtonDirective } from './spartan/ui-button-helm/src';
import { NgIf } from '@angular/common';

@Component({
  selector: 'oeb-button',
  standalone: true,
  imports: [HlmButtonDirective, NgIf],
  template: `<button [type]="type" class="tw-relative" hlmBtn [disabled]="disabled" [size]="size" [variant]="variant"><img *ngIf="img" class="md:tw-h-[30px] tw-h-[20px] tw-pr-4" [src]="img"/><span [innerHTML]="text"></span></button> `,
})
export class OebButtonComponent {

    @Input() variant: string = 'default'; 
    @Input() size: string = 'default';
    @Input() disabled: boolean = false;
    @Input() text: string = undefined;
    @Input() img: string = undefined;
    @Input() type: string = 'submit';
}