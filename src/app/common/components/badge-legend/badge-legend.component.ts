import { Component, EventEmitter, Output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'app-badge-legend',
	templateUrl: './badge-legend.component.html',
	styleUrls: ['./badge-legend.component.css'],
	imports: [SvgIconComponent, TranslatePipe],
})
export class BadgeLegendComponent {
	@Output() closed = new EventEmitter();

	close() {
		this.closed.emit();
	}
}
