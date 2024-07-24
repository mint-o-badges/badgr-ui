
import { Component, Input, TemplateRef } from '@angular/core';
import { HlmButtonDirective } from './spartan/ui-button-helm/src';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { HlmIconComponent } from './spartan/ui-icon-helm/src';
import {
  BrnCollapsibleComponent,
  BrnCollapsibleContentComponent,
  BrnCollapsibleTriggerDirective,
} from '@spartan-ng/ui-collapsible-brain';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { NgIf, NgFor, NgTemplateOutlet, NgClass } from '@angular/common';


@Component({
  selector: 'oeb-collapsible',
  providers: [provideIcons({lucideChevronRight })],
  standalone: true,
  imports: [
    BrnCollapsibleComponent,
    BrnCollapsibleTriggerDirective,
    HlmButtonDirective,
    BrnCollapsibleContentComponent,
    HlmIconModule,
    HlmIconComponent,
    NgIf,
    NgFor,
    NgTemplateOutlet,
    NgClass
  ],
  template: `    
        <brn-collapsible class="tw-flex tw-flex-col">
            <button brnCollapsibleTrigger type="button" hlmBtn variant="ghost" size="sm" class="tw-p-0" (click)="toggleOpen()">
            <ngTemplateOutlet *ngIf="isTemplate; else stringTrigger" [ngTemplateOutlet]="trigger"></ngTemplateOutlet>
            <ng-template #stringTrigger>
                <button class="tw-flex tw-w-full !tw-justify-between tw-items-center">
                    {{ trigger }}
                    <hlm-icon class="tw-ml-2" name="lucideChevronDown" hlmMenuIcon />
                </button>
            </ng-template>
                <div>
                    <hlm-icon size='xl' class="tw-text-purple" [ngClass]="{ 'tw-rotate-90': isOpen }" name="lucideChevronRight" />
                 </div>
            </button>
            <brn-collapsible-content>
                <ng-content></ng-content>
            </brn-collapsible-content>
        </brn-collapsible>

  `,
})
export class OebCollapsibleComponent {
    @Input() trigger: any;

    isOpen = false;

    toggleOpen() {
        console.log(this.isOpen);
        this.isOpen = !this.isOpen;
    }

    get isTemplate(): boolean {
        return this.trigger instanceof TemplateRef;
    }
}
