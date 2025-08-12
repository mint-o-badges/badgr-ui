import { NgIcon } from '@ng-icons/core';
import {
	Component,
	Input,
	TemplateRef,
	ViewChild,
	AfterViewInit,
	SimpleChanges,
	Output,
	EventEmitter,
	effect,
} from '@angular/core';
import { HlmButton } from './spartan/ui-button-helm/src';

import { HlmIcon } from './spartan/ui-icon-helm/src';
import {
	BrnCollapsible,
	BrnCollapsibleContent,
	BrnCollapsibleTrigger,
	BrnCollapsibleState,
} from '@spartan-ng/brain/collapsible';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { NgTemplateOutlet, NgClass } from '@angular/common';

@Component({
	selector: 'oeb-collapsible',
	providers: [provideIcons({ lucideChevronRight })],
	imports: [
		BrnCollapsible,
		BrnCollapsibleTrigger,
		HlmButton,
		BrnCollapsibleContent,
		NgIcon,
		HlmIcon,
		NgTemplateOutlet,
		NgClass,
	],
	template: `
		<brn-collapsible class="tw-flex tw-flex-col" #collapsible [disabled]="disabled()">
			<button [attr.id]="id" brnCollapsibleTrigger type="button" hlmBtn variant="ghost" size="sm" class="!tw-p-0">
				@if (isTemplate) {
					<ngTemplateOutlet [ngTemplateOutlet]="trigger"></ngTemplateOutlet>
				} @else {
					<button class="tw-flex tw-w-full !tw-justify-between tw-items-center">
						{{ trigger }}
						<ng-icon hlm class="tw-ml-2" name="lucideChevronDown" hlmMenuIcon />
					</button>
				}
				<div>
					<ng-icon
						hlm
						size="xl"
						class="tw-text-purple"
						[ngClass]="{
							'tw-rotate-90': collapsible.state() == 'open' && closeIcon == 'lucideChevronRight',
							'tw-rotate-180': collapsible.state() == 'open' && closeIcon == 'lucideChevronDown'
						}"
						[name]="closeIcon"
					/>
				</div>
			</button>
			<brn-collapsible-content>
				<ng-content></ng-content>
			</brn-collapsible-content>
		</brn-collapsible>
	`,
})
export class OebCollapsibleComponent implements AfterViewInit {
	@Input() trigger: any;
	@Input() defaultOpen: boolean = false;
	@Input() id: string = null;
	@Input() closeable: boolean = true;
	@Input() closeIcon = 'lucideChevronRight';
	@Output() toggled = new EventEmitter<boolean>();

	@ViewChild('collapsible') collapsible: BrnCollapsible;

	constructor() {
		effect(() => {
			this.collapsible && this.toggled.emit(this.collapsible.state() == 'open');
		});
	}

	ngAfterViewInit() {
		if (this.defaultOpen) {
			this.collapsible.state.set('open');
		}
	}

	get isTemplate(): boolean {
		return this.trigger instanceof TemplateRef;
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.closeable?.currentValue != changes.closeable?.previousValue) {
			this.closeable = changes.closeable.currentValue;
		}
	}

	// disable if open and not closeable
	disabled() {
		return this.collapsible && this.collapsible.state() == 'open' && !this.closeable;
	}
}
