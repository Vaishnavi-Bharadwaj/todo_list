import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { Task } from './task.model';
import { TaskMap } from './taskmap.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor() {}

  private readonly taskMap$ = new BehaviorSubject<TaskMap>(this.readFromStorage());

  readonly taskMapObs$ = this.taskMap$.asObservable();

  getTaskMap(): TaskMap {
    return structuredClone(this.taskMap$.value);
  }

  saveTaskMap(taskMap: TaskMap): void {
    this.taskMap$.next(taskMap);
    localStorage.setItem('task_map', JSON.stringify(taskMap));
  }

  addTask(categoryId: string, task: Task): void {
    const taskMap = this.getTaskMap();
    (taskMap[categoryId] ||= []).push(task);
    this.saveTaskMap(taskMap);
  }

  getTodayTasks(): Task[] {
    const today = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    const todayTasks: Task[] = [];
    Object.values(this.taskMap$.value).forEach(list =>
      list.forEach(t => {
        if (t.dueDate === today) 
          todayTasks.push(t);
      })
    );
    return todayTasks;
  }

  replaceParentTask(updatedParent: Task) {
    const taskMap = this.getTaskMap();
    for (const cat in taskMap) {
      const idx = taskMap[cat].findIndex(t => t.id === updatedParent.id);
      if (idx !== -1) {
        taskMap[cat][idx] = updatedParent;   
        break;
      }
    }
    this.saveTaskMap(taskMap);
  }

  private readFromStorage(): TaskMap {
    const stored = localStorage.getItem('task_map');
    return stored ? JSON.parse(stored) : {};
  }

}
