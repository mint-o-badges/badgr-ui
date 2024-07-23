import { Component, Input, TemplateRef, input } from '@angular/core';
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
import { NgIf, NgFor, NgTemplateOutlet } from '@angular/common';
import type { MenuItem } from '../common/components/badge-detail/badge-detail.component.types';
import { RouterModule } from '@angular/router';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { SharedIconsModule } from '../public/icons.module';

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
    NgTemplateOutlet,
	RouterModule,
    HlmIconModule,
    SharedIconsModule
    ],
    template: `    
    <button [brnMenuTriggerFor]="menu">
        <ngTemplateOutlet *ngIf="isTemplate; else stringTrigger" [ngTemplateOutlet]="trigger"></ngTemplateOutlet>
        <ng-template #stringTrigger>
            <button hlmMenuItem>
                {{ trigger }}
                <hlm-icon name="lucideChevronDown" hlmMenuIcon />
            </button>
        </ng-template>
    </button>

    <ng-template #menu>
    <hlm-menu class="tw-border tw-border-solid tw-border-[var(--color-purple)]">
    <hlm-menu-label *ngIf="label">{{ label }}</hlm-menu-label>
    <ng-container *ngFor="let menuItem of menuItems">
            <button *ngIf="menuItem.action" (click)="menuItem.action()" hlmMenuItem>
            {{menuItem.title}}
             <hlm-icon *ngIf="menuItem.icon" class="tw-ml-2" name={{menuItem.icon}} hlmMenuIcon />
            </button>
            <button *ngIf="menuItem.routerLink" [routerLink]="menuItem.routerLink" hlmMenuItem>
            {{menuItem.title}}
             <hlm-icon *ngIf="menuItem.icon" class="tw-ml-2" name={{menuItem.icon}} hlmMenuIcon />
            </button>

    </ng-container>
    </hlm-menu>
    </ng-template>
`
})

export class OebDropdownComponent {
    @Input() trigger: any;
    @Input() label?: string = '';
    @Input() class?: string = '';
    @Input() menuItems: MenuItem[] = [];
    
    get isTemplate(): boolean {
            return this.trigger instanceof TemplateRef;
    }
}