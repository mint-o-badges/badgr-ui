import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CompetencyTrackingComponent } from '../competency-tracking/competency-tracking.component';
import { ChartData, CompetencyBubbleData } from '../../models/dashboard-models';
import { InfoIcon } from '../../../common/components/info-icon.component';

@Component({
	selector: 'app-oeb-dashboard-competencies',
	standalone: true,
	imports: [CommonModule, TranslatePipe, CompetencyTrackingComponent, InfoIcon],
	templateUrl: './oeb-dashboard-competencies.component.html',
	styleUrls: ['./oeb-dashboard-competencies.component.scss']
})
export class OebDashboardCompetenciesComponent implements OnInit {
	// Gender competency data
	@Input() genderCompetencyData: ChartData = {
		labels: [],
		values: [],
		backgroundColor: []
	};

	// Competency bubble data
	@Input() competencyBubbleData: CompetencyBubbleData[] = [];

	// ESCO competency data
	@Input() escoCompetencyData: ChartData = {
		labels: [],
		values: [],
		backgroundColor: []
	};

	// Total competency hours
	@Input() totalCompetencyHours: number = 12846;

	// Competency hours added last month
	@Input() competencyHoursLastMonth: number = 1923;

	// Average competency hours per competency
	@Input() averageCompetencyHours: number = 9.8;

	// Diversity index
	@Input() diversityIndex: number = 73.2;

	constructor() {}

	ngOnInit(): void {
		// Component initialization
	}
}
