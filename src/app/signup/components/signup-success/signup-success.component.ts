import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SessionService} from '../../../common/services/session.service';
import {Title} from '@angular/platform-browser';
import {AppConfigService} from '../../../common/app-config.service';


@Component({
	selector: 'signup-success',
	templateUrl: './signup-success.component.html',
})
export class SignupSuccessComponent implements OnInit {

constructor(
		private routeParams: ActivatedRoute,
		private title: Title,
		private sessionService: SessionService,
		private configService: AppConfigService,
		private router: Router
	) {
		title.setTitle(`Verification - ${this.configService.theme['serviceName'] || "Badgr"}`);
	}

	email: string;

	ngOnInit() {
        // Ensure the user isn't logged in here, by removing relevant
        // tokens. Don't trigger a change to the loggedInSubject
        // observable though, since the user typically shouldn't
        // be logged in at this point anyway.
		this.sessionService.logout(false);
		this.email = decodeURIComponent(atob(this.routeParams.snapshot.params[ 'email' ]));
	}

	get helpEmailUrl() {
		return `mailto:${this.configService.helpConfig ? this.configService.helpConfig.email || 'help@badgr.io' : 'help@badgr.io'}`;
	}
	get service() {
		return this.configService.theme['serviceName'] || "Badgr";
	}
}
