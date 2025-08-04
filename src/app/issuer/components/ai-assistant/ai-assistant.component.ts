import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiSkill } from '~/common/model/ai-skills.model';
import { AiSkillsService } from '~/common/services/ai-skills.service';
import { MessageService } from '~/common/services/message.service';
import { typedFormGroup } from '~/common/util/typed-forms';
import { CompetencyAccordionComponent } from '~/components/accordion.component';
import { AltchaComponent } from '~/components/altcha.component';
import { OebInputComponent } from '~/components/input.component';
import { OebButtonComponent } from '~/components/oeb-button.component';
import { OebCheckboxComponent } from '~/components/oeb-checkbox.component';

@Component({
	selector: 'ai-assistant',
	templateUrl: './ai-assistant.component.html',
	standalone: true,
	imports: [
		TranslateModule,
		OebButtonComponent,
		FormsModule,
		CommonModule,
		AltchaComponent,
		OebInputComponent,
		OebCheckboxComponent,
		CompetencyAccordionComponent,
		RouterModule,
	],
})
export class AiAssistantComponent implements AfterViewInit {
	aiCompetenciesLoading = false;
	aiCompetenciesDescription: string = '';
	aiCompetenciesSuggestions: ApiSkill[] = [];
	suggestCompetenciesText = this.translate.instant('CreateBadge.suggestCompetencies');
	detailedDescription = this.translate.instant('CreateBadge.detailedDescription');
	showBadgeDemo = false;

	@ViewChild('altcha') altcha: AltchaComponent;
	altchaValue = '';

	@ViewChild('top') top: ElementRef<HTMLElement>;

	positiveIntegerOrNull(control: AbstractControl) {
		const val = parseFloat(control.value);

		if (isNaN(val)) {
			return { emptyField: this.translate.instant('OEBComponents.fieldIsRequired') };
		}
		if (!Number.isInteger(val) || val < 0) {
			return { negativeDuration: this.translate.instant('CreateBadge.durationPositive') };
		}
	}

	aiForm = typedFormGroup().addArray(
		'aiCompetencies',
		typedFormGroup()
			.addControl('selected', false)
			.addControl('hours', '1', [this.positiveIntegerOrNull, Validators.max(999)])
			.addControl('minutes', '0', [this.positiveIntegerOrNull, Validators.max(59)]),
	);

	requiredError = this.translate.instant('CreateBadge.requiredError');

	constructor(
		protected aiSkillsService: AiSkillsService,
		private translate: TranslateService,
		private messageService: MessageService,
		private changeDetectorRef: ChangeDetectorRef,
	) {}

	ngAfterViewInit(): void {
		this.altcha.valueEvent.subscribe((value) => {
			if (value) {
				this.altchaValue = value;
				// not sure why this is needed, but angular does not update the view otherwise
				this.changeDetectorRef.detectChanges();
			}
		});
	}

	suggestCompetencies() {
		if (this.aiCompetenciesDescription.length < 70) {
			return;
		}
		if (!this.altchaValue) {
			return;
		}

		this.aiSkillsService.setAltcha(this.altchaValue);

		this.aiCompetenciesLoading = true;
		this.aiSkillsService
			.getAiSkills(this.aiCompetenciesDescription)
			.then((skills) => {
				let aiCompetencies = this.aiForm.controls.aiCompetencies;
				const selectedAiCompetencies = aiCompetencies.value
					.map((c, i) => (c.selected ? this.aiCompetenciesSuggestions[i] : null))
					.filter(Boolean);
				for (let i = aiCompetencies.length - 1; i >= 0; i--) {
					aiCompetencies.removeAt(i);
				}
				this.aiCompetenciesSuggestions = [
					...selectedAiCompetencies,
					...skills.filter(
						(skill) =>
							!selectedAiCompetencies.some((existing) => existing.concept_uri === skill.concept_uri),
					),
				];

				this.aiCompetenciesSuggestions.forEach((skill, i) => {
					aiCompetencies.addFromTemplate();
					if (selectedAiCompetencies.includes(skill)) {
						this.aiForm.controls.aiCompetencies.controls[i].setValue({
							...this.aiForm.controls.aiCompetencies.controls[i].value,
							selected: true,
						});
					}
				});
				this.aiCompetenciesLoading = false;
			})
			.catch((error) => {
				this.aiCompetenciesLoading = false;
				this.messageService.reportAndThrowError(`Failed to obtain ai skills: ${error.message}`, error);
			})
			.finally(() => {
				// clear old altcha value from http service
				this.aiSkillsService.setAltcha(null);
				// get a new alcha challenge
				this.altcha.verify();
			});
	}

	formatStudyLoad(hours: string, minutes: string) {
		return `${hours}:${minutes.padStart(2, '0')} h`;
	}

	competenciesSelected() {
		let aiCompetencies = this.aiForm.controls.aiCompetencies;
		const selectedAiCompetencies = aiCompetencies.value
			.map((c, i) => (c.selected ? this.aiCompetenciesSuggestions[i] : null))
			.filter(Boolean);

		return selectedAiCompetencies.length > 0;
	}

	showDemo() {
		this.showBadgeDemo = true;
		this.top.nativeElement.scrollIntoView({ behavior: 'smooth' });
	}
}
