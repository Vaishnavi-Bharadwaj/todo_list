import { SubTask } from "./subtask.model";

export interface Task {
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

