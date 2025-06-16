import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Skill } from 'app/common/model/ai-skills.model';
import { AiSkillsService } from 'app/common/services/ai-skills.service';
import { MessageService } from 'app/common/services/message.service';
import { AltchaComponent } from 'app/components/altcha.component';
import { OebButtonComponent } from 'app/components/oeb-button.component';

@Component({
	selector: 'ai-assistant',
	templateUrl: './ai-assistant.component.html',
	standalone: true,
	imports: [TranslateModule, OebButtonComponent, FormsModule, CommonModule, AltchaComponent]
})
export class AiAssistantComponent implements AfterViewInit {

	aiCompetenciesLoading = false;
	aiCompetenciesDescription: string = '';
	aiCompetenciesSuggestions: Skill[] = [];
	suggestCompetenciesText = this.translate.instant('CreateBadge.suggestCompetencies');
	detailedDescription = this.translate.instant('CreateBadge.detailedDescription');

	@ViewChild('altcha') altcha: AltchaComponent;
	altchaValue = "";

	constructor(
		protected aiSkillsService: AiSkillsService,
		private translate: TranslateService,
		private messageService: MessageService,
		private changeDetectorRef: ChangeDetectorRef
	) {
	}

	ngAfterViewInit(): void {
		this.altcha.valueEvent.subscribe((value) => {
			if (value) {
				this.altchaValue = value;
				// FIXME: not sure why this is needed, but angular does not update the view otherwise
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
				this.aiCompetenciesSuggestions = skills;
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
}
