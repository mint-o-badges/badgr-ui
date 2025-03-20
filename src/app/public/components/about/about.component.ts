import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css'],
    standalone: false
})
export class AboutComponent implements OnInit {
  mailAddress = "hallo@openbadges.education";
  mailBody= "Interesse an Open Educational Badges";
  constructor() { }

  ngOnInit() {
  }
}
