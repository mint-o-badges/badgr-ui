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
import { HlmButtonDirective } from './spartan/ui-button-helm/src';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { HlmIconComponent } from './spartan/ui-icon-helm/src';
import {
	BrnCollapsibleComponent,
	BrnCollapsibleContentComponent,
	BrnCollapsibleTriggerDirective,
	BrnCollapsibleState,
} from '@spartan-ng/brain/collapsible';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { NgIf, NgFor, NgTemplateOutlet, NgClass } from '@angular/common';

@Component({
	selector: 'oeb-collapsible',
	providers: [provideIcons({ lucideChevronRight })],
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
		NgClass,
	],
	template: `
		<brn-collapsible class="tw-flex tw-flex-col" #collapsible [disabled]="disabled()">
			<button [attr.id]="id" brnCollapsibleTrigger type="button" hlmBtn variant="ghost" size="sm" class="!tw-p-0">
				<ngTemplateOutlet
					*ngIf="isTemplate; else stringTrigger"
					[ngTemplateOutlet]="trigger"
				></ngTemplateOutlet>
				<ng-template #stringTrigger>
					<button class="tw-flex tw-w-full !tw-justify-between tw-items-center">
						{{ trigger }}
						<hlm-icon class="tw-ml-2" name="lucideChevronDown" hlmMenuIcon />
					</button>
				</ng-template>
				<div>
					<hlm-icon
						size="xl"
						class="tw-text-purple"
						[ngClass]="{ 'tw-rotate-90': collapsible.state() == 'open' }"
						name="lucideChevronRight"
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
	@Output() toggled = new EventEmitter<boolean>();

	@ViewChild('collapsible') collapsible: BrnCollapsibleComponent;

	constructor() {
		effect(() => {
			this.toggled.emit(this.collapsible.state() == 'open');
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
		if (changes.closeable.currentValue != changes.closeable.previousValue) {
			this.closeable = changes.closeable.currentValue;
		}
	}

	// disable if open and not closeable
	disabled() {
		return this.collapsible && this.collapsible.state() == 'open' && !this.closeable;
	}
}
