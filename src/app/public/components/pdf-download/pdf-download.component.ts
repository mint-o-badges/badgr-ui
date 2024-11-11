import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-download',
  template: `<p hlmP class="oeb page-padding tw-text-oebblack tw-text-xl">{{text}}</p>`
})
export class PdfDownloadComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
  ) {}

  text = ""


  pdfFiles = {
    "file1": "oeb_examples.pdf",
    "file2": "MintOBadges_Begleitforschung.pdf",
    "file3": "Value-For-Good.pdf"
  };

  ngOnInit(): void {
    this.text = "Downloading your file...";

    const fileName = this.route.snapshot.params['pdfName'];

    switch (fileName) {
        case "oeb_examples.pdf":
          this.downloadFile('/assets/pdfs/oeb_examples.pdf');
          break;
        case "MintOBadges_Begleitforschung.pdf":
          this.downloadFile('/assets/pdfs/MintOBadges_Begleitforschung.pdf');
          break;
        case "Value-For-Good.pdf":
          this.downloadFile('/assets/pdfs/Value-For-Good.pdf');
          break;
        default:
          this.text = 'Datei nicht gefunden. Bitte überprüfe die URL. ';
      }
  }
  downloadFile(url) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = url.split('/').pop(); 
    document.body.appendChild(anchor);
    anchor.click();
    this.text = 'Download abgeschlossen.';
    document.body.removeChild(anchor);
  }
}
