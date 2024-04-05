import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
	selector: 'app-badge-legend',
	templateUrl: './badge-legend.component.html',
	styleUrls: ['./badge-legend.component.css'],
})
export class BadgeLegendComponent implements OnInit {
	@Output() closed = new EventEmitter();

	constructor() {}

	ngOnInit() {}

	close() {
		this.closed.emit();
	}
}
