import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CmsPageComponent } from '~/common/components/cms/cms-page.component';
import { OebBadgeClassEditForm } from '~/issuer/components/badgeclass-edit-form/oeb-badgeclass-edit-form.component';

@Component({
	selector: 'app-start',
	template: `<div>
		<oeb-badgeclass-edit-form [issuer]="this.issuer" token="YzJrxHrRdRmWlbu091GPy7EorYw3KW" />
		<cms-page [slug]="translate.currentLang == 'de' ? 'startseite' : 'homepage'" />
	</div>`,
	standalone: true,
	imports: [CmsPageComponent, OebBadgeClassEditForm],
})
export class StartComponent {
	constructor(protected translate: TranslateService) {}

	get issuer() {
		return JSON.parse(`{
		"created_at": "2025-09-08T11:07:41.403756Z",
		"created_by": "david.scheidt@opensenselab.org",
		"name": "Davids Geheimorganisation",
		"slug": "HAssrqGhTqmgeRok4AdQvg",
		"image": "http://localhost:8000/media/uploads/issuers/spongebob.png",
		"description": "Meine Geheimorganisation über die niemand etwas erfahren darf. Alle Infos gibts auf der Website. Ach ne, die ist geheim. Bitte ignorieren, hier steht nur Unsinn, der nicht von Relevanz ist und keinerlei Bedeutung hat.",
		"url": "https://www.opensenselab.org",
		"badgrapp": "localhost:4200",
		"staff": [
			{
				"user": {
					"first_name": "Sven",
					"last_name": "Heitmann",
					"email": "sven.heitmann@opensenselab.org",
					"url": [],
					"telephone": [],
					"slug": "dOk35DkLRmC45PH8yuth7A",
					"agreed_terms_version": 10,
					"marketing_opt_in": false,
					"has_password_set": true,
					"secure_password_set": true,
					"latest_terms_version": 10
				},
				"role": "staff"
			},
			{
				"user": {
					"first_name": "David",
					"last_name": "Scheidt",
					"email": "david.scheidt@opensenselab.org",
					"url": [],
					"telephone": [],
					"slug": "ENLOlJwcSIeea2u0Rg6fFw",
					"agreed_terms_version": 10,
					"marketing_opt_in": false,
					"has_password_set": true,
					"secure_password_set": true,
					"latest_terms_version": 10
				},
				"role": "owner"
			}
		],
		"source_url": null,
		"country": null,
		"state": null,
		"is_network": false,
		"linkedinId": "",
		"email": "david.scheidt@opensenselab.org",
		"networks": [
			{
				"created_at": "2025-10-06T08:26:42.425780Z",
				"created_by": "david.scheidt@opensenselab.org",
				"name": "Rock Bottom Anti-Social Club",
				"slug": "uB7tlIg2S3yX-ekAzeLc1g",
				"image": "http://localhost:8000/media/uploads/issuers/issuer_logo_34284bb2-dce9-41e9-94c0-b10303f59e29.png",
				"description": "Der Tiefpunkt der Schöpfung in Rock Bottom. Der Tiefpunkt der Schöpfung in Rock Bottom. Der Tiefpunkt der Schöpfung in Rock Bottom. Der Tiefpunkt der Schöpfung in Rock Bottom. Der Tiefpunkt der Schöpfung in Rock Bottom.",
				"url": "https://rock-bottom.rocks",
				"badgrapp": "localhost:4200",
				"staff": [
					{
						"user": {
							"first_name": "David",
							"last_name": "Scheidt",
							"email": "david.scheidt@opensenselab.org",
							"url": [],
							"telephone": [],
							"slug": "ENLOlJwcSIeea2u0Rg6fFw",
							"agreed_terms_version": 10,
							"marketing_opt_in": false,
							"has_password_set": true,
							"secure_password_set": true,
							"latest_terms_version": 10
						},
						"role": "owner"
					}
				],
				"source_url": null,
				"country": "Germany",
				"state": "",
				"is_network": true,
				"linkedinId": "",
				"json": {
					"@context": "https://w3id.org/openbadges/v1",
					"type": "Issuer",
					"id": "http://localhost:8000/public/issuers/uB7tlIg2S3yX-ekAzeLc1g",
					"name": "Rock Bottom Anti-Social Club",
					"url": "https://rock-bottom.rocks",
					"email": null,
					"description": "Der Tiefpunkt der Schöpfung in Rock Bottom. Der Tiefpunkt der Schöpfung in Rock Bottom. Der Tiefpunkt der Schöpfung in Rock Bottom. Der Tiefpunkt der Schöpfung in Rock Bottom. Der Tiefpunkt der Schöpfung in Rock Bottom.",
					"category": "n/a",
					"slug": "uB7tlIg2S3yX-ekAzeLc1g",
					"image": "http://localhost:8000/public/issuers/uB7tlIg2S3yX-ekAzeLc1g/image"
				},
				"current_user_network_role": "owner"
			}
		],
		"verified": true,
		"category": "andere",
		"street": "Von-Steuben-Str.",
		"streetnumber": "19",
		"zip": "48149",
		"city": "Münster",
		"intendedUseVerified": true,
		"lat": null,
		"lon": null,
		"json": {
			"@context": "https://w3id.org/openbadges/v1",
			"type": "Issuer",
			"id": "http://localhost:8000/public/issuers/HAssrqGhTqmgeRok4AdQvg",
			"name": "Davids Geheimorganisation",
			"url": "https://www.opensenselab.org",
			"email": "david.scheidt@opensenselab.org",
			"description": "Meine Geheimorganisation über die niemand etwas erfahren darf. Alle Infos gibts auf der Website. Ach ne, die ist geheim. Bitte ignorieren, hier steht nur Unsinn, der nicht von Relevanz ist und keinerlei Bedeutung hat.",
			"category": "andere",
			"slug": "HAssrqGhTqmgeRok4AdQvg",
			"image": "http://localhost:8000/public/issuers/HAssrqGhTqmgeRok4AdQvg/image"
		},
		"badgeClassCount": 8,
		"learningPathCount": 0,
		"recipientGroupCount": 0,
		"recipientCount": 0,
		"pathwayCount": 0,
		"ownerAcceptedTos": true
	}`);
	}
}
