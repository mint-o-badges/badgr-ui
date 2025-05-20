import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-badge-legend',
    templateUrl: './badge-legend.component.html',
    styleUrls: ['./badge-legend.component.css'],
    imports: [SvgIconComponent, TranslatePipe],
})
export class BadgeLegendComponent implements OnInit {
	@Output() closed = new EventEmitter();

	constructor() {}

	ngOnInit() {}

	close() {
		this.closed.emit();
	}
}
