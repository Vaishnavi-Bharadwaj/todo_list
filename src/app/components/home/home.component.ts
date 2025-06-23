import { Component, HostListener } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { TasksComponent } from './menu/tasks/tasks.component';
import { DUMMY_MENU_LIST } from './dummy-menu-list';
import { FormsModule } from '@angular/forms';
import { DatePipe, formatDate } from '@angular/common';
import { CommonModule } from '@angular/common';
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
  subTasks?: SubTask[];
  priorityColor: string;
  newSubtaskTitle?: string;
  newSubtaskDate?:string;
  showSubtaskInput?: boolean;
}

interface SubTask {
  id: string;
  title: string;
  dueDate: string;
  isPinned: boolean;
  isCompleted: boolean;
  priorityColor: string;
}

interface TaskMap {
  [menu_id: string]: Task[];
}

@Component({
  selector: 'app-home',
  imports: [MenuComponent, TasksComponent, FormsModule, DatePipe, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isCloseMenu:boolean=false;
  showDate=false;
  preventBlur = false;
  openDropdownId: string | null = null;
  category_id: string;
  todayTasks: Task[] = [];
  todayNewtask: Partial<Task> = { title: '', dueDate: '' };  
  taskMap: TaskMap = {};

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
    this.category_id=this.category_list[0].menu_id;
    
    const stored = localStorage.getItem('task_map');
    if (stored) {
      this.taskMap  = JSON.parse(stored);
    }
    this.loadTodayTasks();
  }

  loadTodayTasks() {
    const stored = localStorage.getItem('task_map');
    if (stored) {
      this.taskMap = JSON.parse(stored);
      const today = formatDate(new Date(), 'yyyy-MM-dd', 'en');
      this.todayTasks = [];

      Object.values(this.taskMap).forEach(taskList => {
        taskList.forEach(task => {
          const isTaskDueToday = task.dueDate === today;
          if (isTaskDueToday) {
            this.todayTasks.push(task);
          } else if (task.subTasks && task.subTasks.length > 0) {
            const subtasksDueToday = task.subTasks.filter(subtask => subtask.dueDate === today);
            subtasksDueToday.forEach(subtask => {
              this.todayTasks.push(subtask);
            });
          }
        });
      });
    }

    this.todayTasks.forEach(item => {
      item.showSubtaskInput = false;
    });
  }

  onSelectCategory(menu_id:string)
  {
    this.category_id=menu_id;
  }

  onAdd() {
    if (!this.todayNewtask.title) return;

    const today = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    const task: Task = {
      id: Date.now().toString(),
      title: this.todayNewtask.title!,
      dueDate: today,
      isPinned: false,
      isCompleted: false,
      priorityColor: 'black'
    };

    if (!this.taskMap[this.category_id]) {
      this.taskMap[this.category_id] = [];
    }

    this.taskMap[this.category_id].push(task);
    localStorage.setItem('task_map', JSON.stringify(this.taskMap));

    this.todayNewtask = { title: '', dueDate: '' };
    this.loadTodayTasks();
  }

  showSubtaskInput(task: Task) {
    task.showSubtaskInput = true;
  }

  addSubtask(task: Task) {
    if(!task.subTasks)
      task.subTasks=[];
    if(!task.newSubtaskTitle || task.newSubtaskTitle.trim()==='')
      return;
    if(!task.newSubtaskDate || task.newSubtaskDate.trim()==='')
      return;
    const subtask: SubTask = {
      id: Date.now().toString(),
      title: task.newSubtaskTitle.trim(),
      dueDate: task.newSubtaskDate,
      isPinned: false,
      isCompleted: false,
      priorityColor: 'black'
    }
    task.subTasks.push(subtask);
    task.newSubtaskTitle='';
    task.newSubtaskDate='';
    this.saveTasks();
    task.showSubtaskInput=false;
  }

  onDeleteTask(task_id: string) {
    const stored = localStorage.getItem('task_map');
    if (!stored) return;

    let taskMap: TaskMap = JSON.parse(stored);
    let isDeleted = false;

    Object.keys(taskMap).forEach(menuId => {
      // Try to delete main task
      const initialLength = taskMap[menuId].length;
      taskMap[menuId] = taskMap[menuId].filter(task => task.id !== task_id);
      if (taskMap[menuId].length < initialLength) {
        isDeleted = true; // Main task deleted
      }

      // Try to delete from subtasks
      taskMap[menuId].forEach(task => {
        if (task.subTasks && task.subTasks.length > 0) {
          const initialSubLength = task.subTasks.length;
          task.subTasks = task.subTasks.filter(subtask => subtask.id !== task_id);
          if (task.subTasks.length < initialSubLength) {
            isDeleted = true; // Subtask deleted
          }
        }
      });
    });

    if (isDeleted) {
      localStorage.setItem('task_map', JSON.stringify(taskMap));
      this.loadTodayTasks(); 
    }
  }

  pinTask(task: Task) {
    task.isPinned = true;
    if (task.subTasks && task.subTasks.length > 0) {
      task.subTasks.forEach(subtask => subtask.isPinned = true);
    }
    this.loadTasks(task)
    this.saveTasks();
  }

  unPinTask(task: Task) {
    task.isPinned = false;
    if (task.subTasks && task.subTasks.length > 0) {
      task.subTasks.forEach(subtask => subtask.isPinned = false);
    }
    this.loadTasks(task)
    this.saveTasks();
  }

  highPriorityTask(task: Task) {
    task.priorityColor = 'red';
    this.loadTasks(task)
    this.saveTasks();
  }

  mediumPriorityTask(task: Task) {
    task.priorityColor='yellow';
    this.loadTasks(task)
    this.saveTasks();
  }

  lowPriorityTask(task: Task) {
    task.priorityColor= 'blue';
    this.loadTasks(task)
    this.saveTasks();
  }

  noPriorityTask(task: Task) {
    task.priorityColor='black';
    this.loadTasks(task)
    this.saveTasks();
  }

  loadTasks(task:Task) {
    const stored = localStorage.getItem('task_map');
    if (stored) {
      const taskMap: TaskMap = JSON.parse(stored);
      for (const menuId in taskMap) {
        const taskList = taskMap[menuId];
        const index = taskList.findIndex(t => t.id === task.id);
        if (index !== -1) {
          taskMap[menuId][index] = task;
          break;
        }
      }
    }
  }

  markComplete(item: Task | SubTask) {
    for (const menuId in this.taskMap) {
      for (const task of this.taskMap[menuId]) {
        // Main Task
        if (task.id === item.id) {
          task.isCompleted = true;
          if (task.subTasks && task.subTasks.length > 0) {
            task.subTasks.forEach(subtask => subtask.isCompleted = true);
          }
          this.saveTasks();
          this.loadTodayTasks();
          return;
        }

        // SubTask
        if (task.subTasks && task.subTasks.length > 0) {
          const subtaskIndex = task.subTasks.findIndex(sub => sub.id === item.id);
          if (subtaskIndex !== -1) {
            task.subTasks[subtaskIndex].isCompleted = true;
            // When a subtask is marked complete, keep the parent incomplete
            task.isCompleted = false;
            this.saveTasks();
            this.loadTodayTasks();
            return;
          }
        }
      }
    }
  }


  markIncomplete(item: Task | SubTask, parentTask?: Task) {
    const stored = localStorage.getItem('task_map');
    if (!stored) return;
    let taskMap: TaskMap = JSON.parse(stored);
    for (const menuId in taskMap) {
      for (const task of taskMap[menuId]) {
        // Main Task
        if (task.id === item.id) {
          task.isCompleted = false;
          // When main task is unchecked, do not change the subtasks
          localStorage.setItem('task_map', JSON.stringify(taskMap));
          this.loadTodayTasks();
          return;
        }

        // SubTask
        if (task.subTasks && task.subTasks.length > 0) {
          const subtaskIndex = task.subTasks.findIndex(sub => sub.id === item.id);
          if (subtaskIndex !== -1) {
            task.subTasks[subtaskIndex].isCompleted = false;
            // Uncheck parent if any subtask is incomplete
            if (task.isCompleted) {
              task.isCompleted = false;
            }
            localStorage.setItem('task_map', JSON.stringify(taskMap));
            this.loadTodayTasks();
            return;
          }
        }
      }
    }
  }

  toggleDropdown(task_id: string) {
    this.openDropdownId = this.openDropdownId === task_id ? null : task_id;
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.openDropdownId = null;
    }
  }

  get pinnedTasks(): Task[] {
    return this.todayTasks.filter(t => t.isPinned && !t.isCompleted);
  }

  get activeTasks(): Task[] {
    return this.todayTasks.filter(t => !t.isCompleted && !t.isPinned);
  }

  get completedTasks(): Task[] {
    return this.todayTasks.filter(task => 
      task.isCompleted || (task.subTasks && task.subTasks.length > 0 && task.subTasks.some(sub => sub.isCompleted))
    );
  }

  saveTasks() {
    localStorage.setItem('task_map', JSON.stringify(this.taskMap));
  }

}
