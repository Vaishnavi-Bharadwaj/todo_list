import { Component, Input } from '@angular/core';
import { MenuComponent } from '../menu.component';
interface Category {
  menu_id: string;
  name: string;
  icon: string;
  path:string;
}

@Component({
  selector: 'app-tasks',
  imports: [MenuComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
  isCloseMenu:boolean=false;
  @Input() categoryId!: string;
  category_list:Category[]=[];
  showInput: boolean = false;
  showDate=false;
  preventBlur = false;
  showButton=false;

  constructor() {
    const menu_list=localStorage.getItem('menu_list');
    if(menu_list)
    {
      this.category_list=JSON.parse(menu_list) as Category[];
    }
  }

  onCloseMenu()
  {
    this.isCloseMenu=!this.isCloseMenu; //toggle
  }

  onSelectCategory(menu_id:string)
  {
    this.categoryId=menu_id;
  }

  get categoryName(): string {
    const category = this.category_list.find(c => c.menu_id === this.categoryId);
    return category ? category.name : 'Today';
  }

  onToggleInput() {
    this.showInput = true;
  }

  hideDatePicker() { 
      if (!this.preventBlur) {
        this.showDate = false;
        this.showButton = false;
      }
  }

}
