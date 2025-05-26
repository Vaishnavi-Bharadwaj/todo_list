import { Component } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
@Component({
  selector: 'app-home',
  imports: [MenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isCloseMenu:boolean=false;
  onCloseMenu()
  {
    this.isCloseMenu=!this.isCloseMenu; //toggle
  }
}
