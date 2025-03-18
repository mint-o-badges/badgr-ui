import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-about',
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  mailAddress = "support@openbadges.education";
  mailBody= "Interesse an Open Educational Badges";
  constructor() { }

  ngOnInit() {
  }
}
