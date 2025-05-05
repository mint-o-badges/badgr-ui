import { animate, animateChild, query, stagger, state, style, transition, trigger } from '@angular/animations';

export const appearAnimation = [
	trigger('appearAnimation', [
		transition(':enter', [
			style({ transform: 'scale(80%)', opacity: '0' }),
			animate('.2s ease-out', style({ transform: 'scale(100%)', opacity: '1' })),
		]),
	]),
	trigger('stagger', [transition(':enter', [query(':enter', stagger('.03s', [animateChild()]))])]),
];
