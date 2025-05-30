import { Component, HostListener, Input } from '@angular/core';
import { MenuComponent } from '../menu.component';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
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
}

@Component({
  selector: 'app-tasks',
  imports: [MenuComponent, FormsModule, DatePipe],
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
  todo_tasks: Task[] = [];
  newTask: Partial<Task> = { title: '', dueDate: '' };  
  openDropdownId: string | null = null;

  constructor() {
    const menu_list=localStorage.getItem('menu_list');
    if(menu_list)
    {
      this.category_list=JSON.parse(menu_list) as Category[];
    }
    this.loadTasks();
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
      isCompleted: false
    };
    this.todo_tasks.push(task);
    this.saveTasks();
    this.newTask = { title: '', dueDate: '' };
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
  
  onDeleteTask(task_id:string)
  {
    this.todo_tasks=this.todo_tasks.filter((task)=>task.id!==task_id)
    this.saveTasks();
  }

  pinTask(task: Task) {
    task.isPinned = true;
    this.saveTasks();
  }

  unPinTask(task: Task) {
    task.isPinned = false;
    this.saveTasks();
  }

  editTask(task: Task) {
    task.isEditing = true;
  }

  onEditTask(task: Task, event: any) {
    task.title = event.target.innerText.trim();
    task.isEditing = false;
    this.saveTasks();
  }

  markComplete(task: Task) {
    task.isCompleted = true;
    this.saveTasks();
  }

  markIncomplete(task: Task) {
    task.isCompleted = false;
    this.saveTasks();
  }

  get activeTasks(): Task[] {
    const active = this.todo_tasks.filter(t => !t.isCompleted);
    return active.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  }

  get completedTasks(): Task[] {
    return this.todo_tasks.filter(t => t.isCompleted);
  }

  get pinnedTasks(): Task[] {
    return this.todo_tasks.filter(t => t.isPinned)
  }

  saveTasks() {
    localStorage.setItem('todo_tasks', JSON.stringify(this.todo_tasks));
  }

  loadTasks() {
    const stored = localStorage.getItem('todo_tasks');
    if (stored) {
      this.todo_tasks = JSON.parse(stored);
    }
  }



}
