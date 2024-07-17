import { Component, Input, computed, input } from '@angular/core';
import { hlm } from '@spartan-ng/ui-core';
import type { ClassValue } from 'clsx';

export const bg = 'tw-block tw-absolute tw-z-0 tw-opacity-80';


@Component({
  selector: 'oeb-background',
  standalone: true,
  imports: [],
  template: `
      <img [class]="imgClass"
        [src]="image" alt="Circles" />
    `,
    host: {
      '[class]': '_computedClass()',
    },
  })
export class OebBackgroundComponent {
  @Input() image: string;
  @Input() imgClass: string;

  public readonly userClass = input<ClassValue>('', { alias: 'class' });
	protected _computedClass = computed(() => hlm(bg, this.userClass()));
	// protected _computedImgClass = computed(() => this.imageClass);

}