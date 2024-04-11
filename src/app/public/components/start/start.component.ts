import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../common/services/session.service';

@Component({
	selector: 'app-start',
	templateUrl: './start.component.html',
	styleUrls: ['./start.component.scss'],
})
export class StartComponent implements OnInit {
	constructor(public sessionService: SessionService) {}
	public loggedIn = false;

	ngOnInit() {
		this.loggedIn = this.sessionService.isLoggedIn;
	}
}
