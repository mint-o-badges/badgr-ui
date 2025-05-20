import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../common/services/session.service';
import { FormMessageComponent } from '../../../common/components/form-message.component';
import { HlmH1Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h1.directive';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { HlmH2Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h2.directive';
import { HlmH3Directive } from '../../../components/spartan/ui-typography-helm/src/lib/hlm-h3.directive';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss'],
    imports: [
        FormMessageComponent,
        HlmH1Directive,
        HlmPDirective,
        OebButtonComponent,
        RouterLink,
        NgIf,
        HlmH2Directive,
        HlmH3Directive,
        TranslatePipe,
    ],
})
export class StartComponent implements OnInit {
	constructor(public sessionService: SessionService) {}
	public loggedIn = false;
	thumbnailSrc: string = '../../../../../assets/videos/thumbnail.svg';
	videoStarted = false;

	ngOnInit() {
		this.loggedIn = this.sessionService.isLoggedIn;
	}

	startVideo() {
		this.videoStarted = true;
		(document.getElementById('video-iframe') as HTMLIFrameElement).src =
			'https://www.youtube.com/embed/KZqY_jY4ZD4?autoplay=1';
	}
}
