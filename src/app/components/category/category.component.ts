import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TasksComponent } from '../home/menu/tasks/tasks.component';

@Component({
  selector: 'app-category',
  imports: [TasksComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  categoryId: string;

  constructor(private route: ActivatedRoute) {
    this.categoryId = this.route.snapshot.paramMap.get('id') || '';
  }
}
