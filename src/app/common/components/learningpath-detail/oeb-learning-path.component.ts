import { Component, inject, input, Input, OnInit } from '@angular/core';
import { animate, animateChild, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { LearningPathApiService } from '../../services/learningpath-api.service';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DangerDialogComponentTemplate } from '../../dialogs/oeb-dialogs/danger-dialog-template.component';

@Component({
	selector: 'oeb-learning-path',
	templateUrl: './oeb-learning-path.component.html',
	styleUrl: './oeb-learning-path.component.scss',
	animations: [
        trigger('inOutAnimation', [
            transition(':enter', [style({ transform: 'translateX(-120px)', opacity: '0' }), animate('.5s ease-out', style({ transform: 'translateX(0px)', opacity: '1' }))]),
            // transition(':leave', [style({ opacity: '1' }), animate('.5s ease-out', style({ opacity: '0' }))]),
        ]),
		trigger('stagger', [
			transition(':enter', [
			  	query(':enter', stagger('.3s', [animateChild()]))
			])
		])
	],
})
export class OebLearningPathDetailComponent implements OnInit {

	@Input() learningPath;
	@Input() issuer;
	@Input() badges;
	@Input() participants;

	constructor(
		private learningPathApiService: LearningPathApiService
	) {
        
	};
	private readonly _hlmDialogService = inject(HlmDialogService);


	filterFunction(t): boolean {
		return t.completed_at;
	}
	filterFunctionOngoing(t): boolean {
		return !t.completed_at;
	}

	ngOnInit(): void {
		
	}

	public deleteLearningPath(learningPathSlug, issuer) {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponentTemplate, {
			context: {
				delete: () => this.deleteLearningPathApi(learningPathSlug, issuer),
				// qrCodeRequested: () => {},
				variant: "danger",
				text: "Möchtest du diesen Lernpfad wirklich löschen?",
				title: "Lernpfad löschen"
			},
		});
	}

	deleteLearningPathApi(learningPathSlug, issuer){
		this.learningPathApiService.deleteLearningPath(issuer.slug, learningPathSlug).then(
			() => console.log("del")
		);
	}

}
