import { Component } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { TasksComponent } from './menu/tasks/tasks.component';
interface Category {
  menu_id: string;
  name: string;
  icon: string;
  path:string;
}

@Component({
  selector: 'app-home',
  imports: [MenuComponent, TasksComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isCloseMenu:boolean=false;
  showDate=false;

  preventBlur = false;

  hideDatePicker() { 
      if (!this.preventBlur) {
        this.showDate = false;
      }
  }

  onCloseMenu()
  {
    this.isCloseMenu=!this.isCloseMenu; //toggle
  }

  category_list:Category[]=[];
  category_id!:string;
  constructor() {
    const menu_list=localStorage.getItem('menu_list');
    if(menu_list)
    {
      this.category_list=JSON.parse(menu_list) as Category[];
    }
  }

  
  onSelectCategory(menu_id:string)
  {
    this.category_id=menu_id;
  }
}
