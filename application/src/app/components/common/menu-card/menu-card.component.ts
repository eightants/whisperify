import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-card',
  templateUrl: './menu-card.component.html',
  styleUrls: ['./menu-card.component.scss'],
})
export class MenuCardComponent implements OnInit {
  @Input() imagePath: string;
  @Input() title: string;
  @Input() body: string;
  @Input() height: string;

  ngOnInit(): void {
    return;
  }
}
