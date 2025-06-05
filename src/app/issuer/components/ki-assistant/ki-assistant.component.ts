import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Skill } from 'app/common/model/ai-skills.model';
import { AiSkillsService } from 'app/common/services/ai-skills.service';
import { MessageService } from 'app/common/services/message.service';
import { OebButtonComponent } from 'app/components/oeb-button.component';

@Component({
	selector: 'ki-assistant',
	templateUrl: './ki-assistant.component.html',
	standalone: true,
	imports: [TranslateModule, OebButtonComponent, FormsModule, CommonModule]
})
export class KiAssistantComponent {

	aiCompetenciesLoading = false;
	aiCompetenciesDescription: string = '';
	aiCompetenciesSuggestions: Skill[] = [];
	suggestCompetenciesText = this.translate.instant('CreateBadge.suggestCompetencies');
	detailedDescription = this.translate.instant('CreateBadge.detailedDescription');

	constructor(
		protected aiSkillsService: AiSkillsService,
		private translate: TranslateService,
		private messageService: MessageService
	) {
	}

	suggestCompetencies() {
		if (this.aiCompetenciesDescription.length < 70) {
			return;
		}
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
			});
	}
}
