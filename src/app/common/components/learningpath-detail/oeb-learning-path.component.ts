import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'oeb-learning-path',
	templateUrl: './oeb-learning-path.component.html',
	styleUrl: './oeb-learning-path.component.scss',
})
export class OebLearningPathDetailComponent implements OnInit {

	@Input() learningPath;
	@Input() issuer;
	@Input() badges;


	ngOnInit(): void {
		this.badges.forEach(badge => {
			console.log(badge.extension['extensions:CategoryExtension'].Category)
			console.log(badge.extension['extensions:CategoryExtension'].Category === 'competency')
			// if(badge.extension['extensions:CategoryExtension'].Category === 'competency'){

			// }
		});
	}
}
