import { Task } from "./task.model";

export interface TaskMap {
  [menu_id: string]: Task[];
}