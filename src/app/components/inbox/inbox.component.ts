import { Component } from '@angular/core';
import { MenuComponent } from '../home/menu/menu.component';

@Component({
  selector: 'app-inbox',
  imports: [MenuComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent {
  isCloseMenu:boolean=false;
  onCloseMenu()
  {
    this.isCloseMenu=!this.isCloseMenu; //toggle
  }
}
