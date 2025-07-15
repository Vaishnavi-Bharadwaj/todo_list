import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { Task } from './task.model';
import { TaskMap } from './taskmap.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor() {}

  getTaskMap(): TaskMap {
    const stored = localStorage.getItem('task_map');
    return stored ? JSON.parse(stored) : {};
  }

  saveTaskMap(taskMap: TaskMap): void {
    localStorage.setItem('task_map', JSON.stringify(taskMap));
  }

  addTask(categoryId: string, task: Task): void {
    const taskMap = this.getTaskMap();
    (taskMap[categoryId] ||= []).push(task);
    this.saveTaskMap(taskMap);
  }

  getTodayTasks(): Task[] {
    const today = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    const taskMap = this.getTaskMap();
    const todayTasks: Task[] = [];

    Object.values(taskMap).forEach(taskList =>
      taskList.forEach(task => {
        if (task.dueDate === today) {
          todayTasks.push(task);
        } else if (task.subTasks?.length) {
          task.subTasks
            .filter(sub => sub.dueDate === today)
            .forEach(sub => todayTasks.push(sub));
        }
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
        this.saveTaskMap(taskMap);           
        return;
      }
    }
  }

}
