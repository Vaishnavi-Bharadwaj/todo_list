import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { TasksComponent } from './menu/tasks/tasks.component';
import { DUMMY_MENU_LIST } from './dummy-menu-list';
import { FormsModule } from '@angular/forms';
import { DatePipe, formatDate } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Category } from './category.model';
import { Task } from './task.model';
import { SubTask } from './subtask.model';
import { TaskMap } from './taskmap.model';
import { TaskService } from './task.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [MenuComponent, TasksComponent, FormsModule, DatePipe, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit, OnDestroy {
  isCloseMenu:boolean=false;
  showDate=false;
  preventBlur = false;
  openDropdownId: string | null = null;
  category_id: string='';
  todayTasks: Task[] = [];
  todayNewtask: Partial<Task> = { title: '', dueDate: '' };  
  taskMap: TaskMap = {};
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  category_list:Category[]=[];
  private sub!: Subscription;
  constructor(private taskService:TaskService) {
    
  }

  ngOnInit(){
    const menu_list = localStorage.getItem('menu_list');
    if (menu_list) {
      this.category_list = JSON.parse(menu_list);
    } else {
      this.category_list = DUMMY_MENU_LIST;
      localStorage.setItem('menu_list', JSON.stringify(DUMMY_MENU_LIST)); // Save defaults back
    }
    this.category_id=this.category_list[0].menu_id;

    this.sub = this.taskService.taskMapObs$
    .subscribe(map => {
      this.taskMap   = map;
      this.todayTasks = this.taskService.getTodayTasks();
    });
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.openDropdownId = null;
    }

    this.todayTasks.forEach(task => {
      const subtaskInput = document.getElementById('subtask-input-' + task.id);
      if (subtaskInput && !subtaskInput.contains(target)) {
        task.showSubtaskInput = false;
      }
    });
  }

  hideDatePicker() { 
    if (!this.preventBlur) {
      this.showDate = false;
    }
  }

  onCloseMenu()
  {
    this.isCloseMenu=!this.isCloseMenu; //toggle
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

    this.taskService.addTask(this.category_id, task);
    this.todayNewtask = { title: '', dueDate: '' };
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

    this.taskService.replaceParentTask(task);
    task.showSubtaskInput=false;
  }

  onDeleteTask(task_id: string) {
    let taskMap: TaskMap = this.taskService.getTaskMap();
    if (!Object.keys(taskMap).length) return; 
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
      this.taskService.saveTaskMap(taskMap);
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

  onEditTask(item: Task | SubTask, event: any) {
    const updatedText = event.target.innerText.trim();
    if (updatedText) {
      item.title = updatedText;
      this.saveTasks();
    } else {
      event.target.innerText = item.title;
    }
  }

  onKeydown(item: Task | SubTask, event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onEditTask(item, event);
      (event.target as HTMLElement).blur();
      event.preventDefault();
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
            return;
          }
        }
      }
    }
  }

  markIncomplete(item: Task | SubTask, parentTask?: Task) {
    const taskMap = this.taskService.getTaskMap();
    for (const menuId in taskMap) {
      for (const task of taskMap[menuId]) {
        // Main Task
        if (task.id === item.id) {
          task.isCompleted = false;
          // When main task is unchecked, do not change the subtasks
          this.taskService.saveTaskMap(taskMap);   
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
            this.taskService.saveTaskMap(taskMap); 
            return;
          }
        }
      }
    }
  }

  toggleDropdown(task_id: string) {
    this.openDropdownId = this.openDropdownId === task_id ? null : task_id;
  }

  saveTasks() {
    this.taskService.saveTaskMap(this.taskMap);
  }

  loadTasks(task:Task) {
    const taskMap: TaskMap = this.taskService.getTaskMap();
    for (const menuId in taskMap) {
      const taskList = taskMap[menuId];
      const index = taskList.findIndex(t => t.id === task.id);
      if (index !== -1) {
        taskList[index] = task;
        break;
      }

      for (const t of taskList) {
        if (t.subTasks?.length) {
          const sIdx = t.subTasks.findIndex(s => s.id === task.id);
          if (sIdx !== -1) 
          { 
            t.subTasks[sIdx] = task as any; 
            break; 
          }
        }
      }
    }
    this.taskMap = taskMap;
    this.saveTasks();
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

}
