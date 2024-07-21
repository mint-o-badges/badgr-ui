import { Component, Input, input } from '@angular/core';
import { BrnMenuTriggerDirective} from '@spartan-ng/ui-menu-brain'
import { 
    HlmMenuComponent,
    HlmMenuGroupComponent,
    HlmMenuItemDirective,
    HlmMenuItemIconDirective,
    HlmMenuItemSubIndicatorComponent,
    HlmMenuLabelComponent,
    HlmMenuSeparatorComponent,
    HlmMenuShortcutComponent,
    HlmSubMenuComponent, } from './spartan/ui-menu-helm/src/index';
import { NgIf, NgFor, } from '@angular/common';


@Component({
    selector: 'oeb-dropdown',
    standalone: true,
    imports: [
    BrnMenuTriggerDirective,
    HlmMenuComponent,
    HlmSubMenuComponent,
    HlmMenuItemDirective,
    HlmMenuItemSubIndicatorComponent,
    HlmMenuLabelComponent,
    HlmMenuShortcutComponent,
    HlmMenuSeparatorComponent,
    HlmMenuItemIconDirective,
    HlmMenuGroupComponent,
    NgIf,
    NgFor,
    ],
    template: `    
    <oeb-button [brnMenuTriggerFor]="menu">Open</oeb-button>

    <ng-template #menu>
    <hlm-menu>
        <hlm-menu-label *ngIf="label">{{ label }}</hlm-menu-label>
        <hlm-menu-separator />
        <hlm-menu-group>
        <div *ngFor="let menuItem of menuItems">
            <button hlmMenuItem>
                {{menuItem}}
            </button>

            <hlm-menu-separator />
        </div>
        </hlm-menu-group>
    </hlm-menu>
    </ng-template>
`
})

export class OebDropdownComponent {
    @Input() label?: string = '';
    @Input() menuItems: Array<string> = [];


}