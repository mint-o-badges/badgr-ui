import { ComponentFactoryResolver, ComponentRef, Directive, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportModalComponent } from '../../components/import-modal/import-modal.component';
import { RecipientBadgeManager } from '../../../recipient/services/recipient-badge-manager.service';
import { MessageService } from '../../../common/services/message.service';

@Directive({
    selector: '[importLauncher]',
    standalone: false
})
export class ImportLauncherDirective implements OnInit {
	constructor(
		public viewContainerRef: ViewContainerRef,
		private route: ActivatedRoute,
		private componentFactoryResolver: ComponentFactoryResolver,
		private recipientBadgeManager: RecipientBadgeManager,
		private messageService: MessageService,
	) {}

	modalComponent: ComponentRef<ImportModalComponent>;

	ngOnInit() {
		if (localStorage.getItem('signup_source') === 'mozilla' || localStorage.getItem('source') === 'mozilla')
			this.insert();
		if (localStorage.getItem('assertion')) this.import();
	}

	isJson = (str) => {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	};

	insert = () => {
		localStorage.removeItem('signup_source');
		localStorage.removeItem('source');
		const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ImportModalComponent);
		const viewContainerRef = this.viewContainerRef;
		viewContainerRef.clear();
		this.modalComponent = viewContainerRef.createComponent(componentFactory);
		window.setTimeout(() => this.launch(), 0);
	};

	launch = () => {
		this.modalComponent.instance.openDialog();
	};

	import = () => {
		let importGood = 0;
		let importBad = 0;
		if (!this.isJson(localStorage.getItem('assertion'))) {
			console.error('Cannot parse assertion JSON: ' + localStorage.getItem('assertion'));
			localStorage.removeItem('assertion');
			return false;
		}
		const assertions = JSON.parse(localStorage.getItem('assertion') || '[]');
		if (assertions.length) {
			Promise.all(
				assertions.map((assertion) => {
					return this.recipientBadgeManager.createRecipientBadge({ url: decodeURIComponent(assertion) }).then(
						() => importGood++,
						() => {
							importBad++;
							console.error('Could not add badge from URI: ' + decodeURIComponent(assertion));
						},
					);
				}),
			).finally(() => {
				// Toast!
				if (importGood) this.messageService.reportMajorSuccess(`${importGood} Badges successfully imported.`);
				if (importBad) this.messageService.reportHandledError(`${importBad} Badges could not be imported.`);
				localStorage.removeItem('assertion');
			});
		}
	};
}
