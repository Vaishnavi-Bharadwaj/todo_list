import { Component, HostListener } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { TasksComponent } from './menu/tasks/tasks.component';
import { DUMMY_MENU_LIST } from './dummy-menu-list';
import { FormsModule } from '@angular/forms';
import { DatePipe, formatDate } from '@angular/common';
interface Category {
  menu_id: string;
  name: string;
  icon: string;
  path:string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  isPinned: boolean;
  isCompleted: boolean;
}

interface TaskMap {
  [menu_id: string]: Task[];
}

@Component({
  selector: 'app-home',
  imports: [MenuComponent, TasksComponent, FormsModule, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isCloseMenu:boolean=false;
  showDate=false;
  preventBlur = false;
  category_id: string | null = null;
  todayTasks: Task[] = [];


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
  constructor() {
    const menu_list = localStorage.getItem('menu_list');

    if (menu_list) {
      this.category_list = JSON.parse(menu_list);
    } else {
      this.category_list = DUMMY_MENU_LIST;
      localStorage.setItem('menu_list', JSON.stringify(DUMMY_MENU_LIST)); // Save defaults back
    }

    this.loadTodayTasks();
  }

  loadTodayTasks() {
    const stored = localStorage.getItem('task_map');
    if (stored) {
      const taskMap: TaskMap = JSON.parse(stored);
      const today = formatDate(new Date(), 'yyyy-MM-dd', 'en');

      let allTasks: Task[] = [];
      Object.values(taskMap).forEach(taskList => {
        allTasks = [...allTasks, ...taskList];
      });

      this.todayTasks = allTasks.filter(task => task.dueDate === today && !task.isCompleted);
    }
  }
  
  onSelectCategory(menu_id:string)
  {
    this.category_id=menu_id;
  }

}
