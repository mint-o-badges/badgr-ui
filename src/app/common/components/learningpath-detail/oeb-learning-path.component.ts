import { Component, Input, OnInit } from '@angular/core';
import { animate, animateChild, query, stagger, state, style, transition, trigger } from '@angular/animations';

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


	ngOnInit(): void {
		
	}
}
