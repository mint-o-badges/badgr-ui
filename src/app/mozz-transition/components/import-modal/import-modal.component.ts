import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { BaseDialog } from "../../../common/dialogs/base-dialog";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ZipService } from "../../../common/util/zip-service/zip-service.service";
import { ZipEntry } from "../../../common/util/zip-service/interfaces/zip-entry.interface";
import { RecipientBadgeManager } from "../../../recipient/services/recipient-badge-manager.service";
import { MessageService } from "../../../common/services/message.service";
import { UserProfileApiService } from "../../../common/services/user-profile-api.service";

@Component({
  selector: 'import-modal',
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.css']
})
export class ImportModalComponent extends BaseDialog implements OnInit {

	@ViewChild("importModalDialog")
	importModalDialog: ImportModalComponent;
	csvForm: FormGroup;
	readonly csvUploadIconUrl = require('../../../../breakdown/static/images/csvuploadicon.svg');
	files: ZipEntry[];
	file: ZipEntry;
	badgeUploadPromise: Promise<unknown>;
	noManifestError = false;
	inProgress = 0;
	serverErrors: ServerError[] = [];
	unverifiedEmails: UnverifiedEmail[] = [];
	attempts = 0;
	successes = 0;
	duplicateError = {
		'email': null,
		'base64Image': null,
		'error': 'You attempted to upload duplicate badges.'
	};
	unknownServerError = {
		'email': null,
		'base64Image': null,
		'error': 'Unknown system error! Please try later.'
	};
	plural = {
		'badge': {
			'=0' : 'No Badges',
			'=1' : '1 Badge',
			'other' : '# Badges'
		}
	};

	constructor(
		protected formBuilder: FormBuilder,
		componentElem: ElementRef,
		renderer: Renderer2,
		private zipService: ZipService,
		protected recipientBadgeManager: RecipientBadgeManager,
		protected messageService: MessageService,
		private userProfileApiService: UserProfileApiService,
	) {
		super(componentElem, renderer);
		this.csvForm = formBuilder.group({
			zipFile: []
		} as ImportCsvForm<Array<unknown>>);
	}

  ngOnInit() {
		// this.openDialog();
	}

	isJson = (str) => {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	};

	openDialog = () => this.showModal();

	closeDialog = () => this.closeModal();

	parseManifest = (m) => {
		if(!this.isJson(m)) {
			this.noManifestError = true;
			return false;
		}
		this.noManifestError = false;
		const manifest = JSON.parse(m);
		const delayInMS = 250;
		this.attempts = 0;
		Object.keys(manifest).forEach((email) => {
			manifest[email].forEach((f, i) => {
				const reader = new FileReader();
				reader.onload = (e) => setTimeout(() => this.uploadImage(email,reader.result).then(() => {
					this.inProgress--;
					// Are we done with only successes?
					if(!this.inProgress && this.successes && !this.serverErrors && !this.unverifiedEmails) this.displaySuccess();
				}), i * delayInMS);
				this.attempts++;
				this.inProgress++;
				const image = this.files.filter(m => m.filename === f)[0];
				// bad file?
				if (!image) {
					this.inProgress--;
					return false;
				}
				this.zipService.getData(image).data.subscribe(fileData => {
					reader.readAsDataURL(fileData);
				});
			});
		});
	};

	uploadImage(email, base64Image) {
			return this.badgeUploadPromise = this.recipientBadgeManager
				.createRecipientBadge({image:base64Image})
				.then(instance => {
					//this.serverError.splice(this.serverError.indexOf(filename),1);
					this.successes++;
				})
				.catch(err => {
					const message = err.response.error[0].description || err.response.error[0].result || '<UNKNOWN ERROR>';

					// catch illegal errors
					if(!message.match(/^[A-Za-z]/)){
						if(!this.serverErrors.includes(this.unknownServerError)) this.serverErrors.push(this.unknownServerError);
						return false;
					}

					// match known errors
					switch (message) {
						case 'The recipient does not match any of your verified emails':
							const counter = this.unverifiedEmails.findIndex(ue => ue.email === email);
							if (counter > -1) {
								this.unverifiedEmails.splice(counter,1,{
									'email': email,
									count: this.unverifiedEmails[counter].count++,
									base64Files: this.unverifiedEmails[counter].base64Files,
									verify: true
								});
								this.unverifiedEmails[counter].base64Files.push(base64Image);
							} else {
								this.unverifiedEmails.push({
									'email': email,
									count: 1,
									base64Files: [base64Image],
									verify: true
								});
							}
							break;
						case 'You already have this badge in your backpack':
							if(!this.serverErrors.includes(this.duplicateError)) this.serverErrors.push(this.duplicateError);
							break;
						// IT BETTER BE HUMAN READABLE
						default:
							this.serverErrors.push({
								'email': email,
								'base64Image': base64Image,
								'error': message
							});
							break;
					}
				});
	}

	fileChanged(event) {
		this.file = (event.target.files &&event.target.files.length)
			?event.target.files[0]
			:event.dataTransfer.files[0];
		if(!this.file) return false;
		this.zipService.getEntries(this.file).subscribe(files => {
			this.serverErrors = [];
			this.files = files;
			const manifest = files.filter(m => m.filename === "manifest.txt")[0];
			if(manifest) {
				this.noManifestError = false;
				const reader = new FileReader();
				reader.onload = (e) => this.parseManifest(reader.result);
				this.zipService.getData(manifest).data.subscribe(f => reader.readAsText(f));
			} else {
				this.noManifestError = true;
				return false;
			}
		}, (error) => {
			this.noManifestError = true;
			return false;
		});

	}

	verifyEmails(){
		const verify = this.unverifiedEmails.filter(email => email.verify);
		let successes = 0;
		let errors = 0;
		const reupBadges = [];
		Promise.all(verify
			.map(email => {
				return this.userProfileApiService.addEmail(email.email)
					.then(() => {
						successes++;
						reupBadges.push(email);
						email.base64Files.forEach((base64File) => this.uploadImage(email.email, base64File));
					})
					.catch((error) => {
						errors++;
						return;
					});
			})
		).finally(() => {
				this.closeDialog();
				if(successes) this.messageService.reportMajorSuccess( `${successes} email ${(successes>1)?'addresses':'address'} will be verified.`);
				if(errors) this.messageService.reportAndThrowError( `${errors} email ${(errors>1)?'addresses':'address'} can not be verified.`);
				reupBadges.forEach((email) => email.base64File.forEach((base64File) => this.uploadImage(email.email, base64File)));
			});
	}

	displaySuccess = () => {
		this.messageService.reportMajorSuccess(this.successes + " Badges successfully imported.");
		this.closeDialog();
	}

}

interface ServerError {
	email: string;
	base64Image: string;
	error: string;
}

interface UnverifiedEmail {
	email: string;
	count: number;
	verify: boolean;
	base64Files: string[];
}

interface ImportCsvForm<T> {
	zipFile: T;
}
