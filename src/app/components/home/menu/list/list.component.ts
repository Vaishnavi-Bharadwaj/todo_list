import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list',
  imports: [FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  enteredName:string='';
  @Output() canceltask=new EventEmitter();
  @Output() add=new EventEmitter<{
    name:string;
  }>();
  
  onCancelAddList()
  {
    this.canceltask.emit();
  }

  onSubmit() {
    this.add.emit({
      name:this.enteredName
    });
  }
}
