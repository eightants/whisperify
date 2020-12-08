import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";

@Component({
  selector: "app-media-net-ad",
  templateUrl: "./media-net-ad.component.html",
  styleUrls: ["./media-net-ad.component.scss"],
})
export class MediaNetAdComponent implements OnInit {
  @ViewChild("script", { static: false }) script: ElementRef;
  showPopTip = false;

  constructor() {}

  convertToScript() {
    var element = this.script.nativeElement;
    var script = document.createElement("script");
    script.async = true
    script.type = "text/javascript";
    script["data-cfasync"] = "false"
    script.src = "//pl15938767.profitablecpmnetwork.com/b1c576d9af5d00153f5d1e14f9d2164f/invoke.js"
    element.appendChild(script);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.convertToScript();
  }
}
