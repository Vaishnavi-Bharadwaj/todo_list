import { Component, HostListener, Input } from '@angular/core';
import { MenuComponent } from '../menu.component';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
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
  isEditing?: boolean;
  priorityColor: string
  subTasks?: SubTask[];
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
  priorityColor: string
}

interface TaskMap {
  [menu_id: string]: Task[];
}

@Component({
  selector: 'app-tasks',
  imports: [MenuComponent, FormsModule, DatePipe, CommonModule],
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
  newTask: Partial<Task> = { title: '', dueDate: '' };    
  openDropdownId: string | null = null;
  taskMap: TaskMap = {};

  constructor() {
    const menu_list=localStorage.getItem('menu_list');
    if(menu_list)
    {
      this.category_list=JSON.parse(menu_list) as Category[];
      if(this.category_list.length>0)
      {
        this.categoryId=this.category_list[0].menu_id;
      }
    }
    this.loadTasks();

  }

  get todo_tasks(): Task[] {
    return this.taskMap[this.categoryId] || [];
  }

  onCloseMenu()
  {
    this.isCloseMenu=!this.isCloseMenu; //toggle
  }

  onSelectCategory(menu_id:string)
  {
    this.categoryId = menu_id;
    this.showInput = false;
    this.newTask = { title: '', dueDate: '' };
  }

  get categoryName(): string {
    const category = this.category_list.find(c => c.menu_id === this.categoryId);
    return category ? category.name : 'Today';
  }

  onToggleInput() {
    this.showInput = true;
    this.showDate = true;
  }

  hideDatePicker() { 
      if (!this.preventBlur) {
        this.showDate = false;
        this.showButton = false;
      }
  }

  onAdd() {
    if (!this.newTask.title || !this.newTask.dueDate) return;
    const task: Task = {
      id: Date.now().toString(),
      title: this.newTask.title!,
      dueDate: this.newTask.dueDate!,
      isPinned: false,
      isCompleted: false,
      priorityColor: 'black'
    };
    if (!this.taskMap[this.categoryId]) {
      this.taskMap[this.categoryId] = [];
    }

    this.taskMap[this.categoryId].push(task);
    this.saveTasks();
    this.newTask = { title: '', dueDate: '' };
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

  toggleDropdown(task_id: string) {
    this.openDropdownId = this.openDropdownId === task_id ? null : task_id;
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.openDropdownId = null;
    }

    this.todo_tasks.forEach(task => {
      const subtaskInput = document.getElementById('subtask-input-' + task.id);
      if (subtaskInput && !subtaskInput.contains(target)) {
        task.showSubtaskInput = false;
      }
    });

  }

  onDeleteTask(task_id: string) {
    const mainTaskIndex = this.todo_tasks.findIndex(task => task.id === task_id);

    if (mainTaskIndex !== -1) {
      // If it's a main task, remove it
      this.taskMap[this.categoryId].splice(mainTaskIndex, 1);
    } else {
      this.todo_tasks.forEach(task => {
        if (task.subTasks && task.subTasks.length > 0) {
          task.subTasks = task.subTasks.filter(subtask => subtask.id !== task_id);
        }
      });
    }

    this.saveTasks();
    if (this.openDropdownId === task_id) {
      this.openDropdownId = null;
    }
  }


  pinTask(task: Task) {
    task.isPinned = true;
    if (task.subTasks && task.subTasks.length > 0) {
      task.subTasks.forEach(subtask => subtask.isPinned = true);
    }
    this.saveTasks();
  }

  unPinTask(task: Task) {
    task.isPinned = false;
    if (task.subTasks && task.subTasks.length > 0) {
      task.subTasks.forEach(subtask => subtask.isPinned = false);
    }
    this.saveTasks();
  }

  highPriorityTask(task: Task) {
    task.priorityColor= 'red';
    this.saveTasks();
  }

  mediumPriorityTask(task: Task) {
    task.priorityColor='yellow';
    this.saveTasks();
  }

  lowPriorityTask(task: Task) {
    task.priorityColor= 'blue';
    this.saveTasks();
  }

  noPriorityTask(task: Task) {
    task.priorityColor='black';
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
    if ('subTasks' in item) 
    { 
      // main task
      item.isCompleted = true;
      if (item.subTasks && item.subTasks.length > 0) {
          item.subTasks.forEach(subtask => subtask.isCompleted = true);
        }
    } 
    else 
    { 
      // subtask
      item.isCompleted = true;
      for (const task of this.todo_tasks) {
        if (task.subTasks?.some(sub => sub.id === item.id)) {
          task.isCompleted = false; 
          break;
        }
      }
    }

    this.taskMap[this.categoryId] = [...this.todo_tasks]; 
    this.saveTasks();

  }

  markIncomplete(item: Task | SubTask, parentTask?: Task) {
    item.isCompleted = false;

    if ('subTasks' in item) { 
      // Main task unchecked
      // Do not uncheck subtasks when the main task is unchecked
    } else { 
      // Subtask unchecked
      // Find the parent task in case parentTask is not passed
      if (!parentTask) {
        for (const task of this.todo_tasks) {
          if (task.subTasks?.some(sub => sub.id === item.id)) {
            parentTask = task;
            break;
          }
        }
      }

      // Uncheck the parent if any subtask is incomplete
      if (parentTask && parentTask.isCompleted) {
        parentTask.isCompleted = false;
      }
    }

    this.taskMap[this.categoryId] = [...this.todo_tasks]; 
    this.saveTasks();
  }

  get activeTasks(): Task[] {
    return this.todo_tasks.filter(t => !t.isCompleted && !t.isPinned);
  }

  get completedTasks(): Task[] {
    return this.todo_tasks.filter(task => 
      task.isCompleted || (task.subTasks && task.subTasks.length > 0 && task.subTasks.some(sub => sub.isCompleted))
    );
  }

  get pinnedTasks(): Task[] {
    return this.todo_tasks.filter(t => t.isPinned && !t.isCompleted);
  }

  saveTasks() {
    localStorage.setItem('task_map', JSON.stringify(this.taskMap));
  }

  loadTasks() {
    const stored = localStorage.getItem('task_map');
    if (stored) {
      this.taskMap = JSON.parse(stored);
    }
  }
}
