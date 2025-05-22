import { NgIcon } from '@ng-icons/core';
import { Component, Input, TemplateRef } from '@angular/core';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import {
	HlmMenuComponent,
	HlmMenuItemDirective,
	HlmMenuItemIconDirective,
	HlmMenuItemVariants,
	HlmMenuLabelComponent,
} from './spartan/ui-menu-helm/src/index';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import type { MenuItem } from '../common/components/badge-detail/badge-detail.component.types';
import { RouterModule } from '@angular/router';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { SharedIconsModule } from '../public/icons.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'oeb-dropdown',
	imports: [
		BrnMenuTriggerDirective,
		HlmMenuComponent,
		HlmMenuItemDirective,
		HlmMenuLabelComponent,
		HlmMenuItemIconDirective,
		NgIf,
		NgFor,
		NgTemplateOutlet,
		RouterModule,
		NgIcon,
		HlmIconModule,
		SharedIconsModule,
		TranslateModule,
	],
	template: `
		<button
			[brnMenuTriggerFor]="menu"
			[disabled]="!hasEnabledMenuItem"
			class="disabled:tw-pointer-events-none disabled:tw-opacity-50"
		>
			<ngTemplateOutlet *ngIf="isTemplate; else stringTrigger" [ngTemplateOutlet]="trigger"></ngTemplateOutlet>
			<ng-template #stringTrigger>
				<button [class]="triggerStyle" [disabled]="!hasEnabledMenuItem">
					{{ trigger | translate }}
					<ng-icon hlm class="tw-ml-2" name="lucideChevronDown" hlmMenuIcon />
				</button>
			</ng-template>
		</button>

		<ng-template #menu>
			<hlm-menu [size]="size" [inset]="inset" class="tw-border-[var(--color-purple)] tw-border-2">
				<hlm-menu-label [size]="size" *ngIf="label">{{ label }}</hlm-menu-label>
				<ng-container *ngFor="let menuItem of menuItems">
					<button
						*ngIf="menuItem.action"
						(click)="menuItem.action($event)"
						[size]="size"
						[disabled]="menuItem.disabled"
						hlmMenuItem
					>
						<ng-icon hlm [size]="iconClass" *ngIf="menuItem.icon" name="{{ menuItem.icon }}" hlmMenuIcon />
						{{ menuItem.title | translate }}
					</button>
					<button
						routerLinkActive="tw-bg-lightpurple"
						*ngIf="menuItem.routerLink"
						[disabled]="menuItem.disabled"
						[routerLink]="menuItem.routerLink"
						[size]="size"
						hlmMenuItem
					>
						<ng-icon
							hlm
							class="tw-mr-3"
							[size]="iconClass"
							*ngIf="menuItem.icon"
							name="{{ menuItem.icon }}"
							hlmMenuIcon
						/>
						{{ menuItem.title | translate }}
					</button>
				</ng-container>
			</hlm-menu>
		</ng-template>
	`,
	styleUrls: ['../app.component.scss'],
})
export class OebDropdownComponent {
	@Input() trigger: any;
	@Input() size: HlmMenuItemVariants['size'] = 'default';
	@Input() inset: HlmMenuItemVariants['inset'] = false;
	@Input() triggerStyle: string =
		'tw-border tw-border-solid tw-border-purple tw-px-1 tw-py-2 tw-rounded-xl disabled:tw-pointer-events-none disabled:tw-opacity-50';
	@Input() label?: string = '';
	@Input() class?: string = '';
	@Input() menuItems: MenuItem[];

	get isTemplate(): boolean {
		return this.trigger instanceof TemplateRef;
	}

	/**
	 * Checks given {@link menuItems} input for enabled items.
	 * Used to disable the trigger depending on its return value.
	 * @returns true when {@link menuItems} is undefined or empty or
	 * any of the menu items is not disabled, false otherwise.
	 */
	get hasEnabledMenuItem(): boolean {
		if (this.menuItems === undefined || this.menuItems === null || this.menuItems.length === 0) return true;
		return this.menuItems.find((m) => !m.disabled) !== undefined;
	}

	get iconClass(): string {
		switch (this.size) {
			case 'sm':
				return '1.25rem';
			case 'lg':
				return '1.75rem';
			default:
				return '1.25rem';
		}
	}
}
