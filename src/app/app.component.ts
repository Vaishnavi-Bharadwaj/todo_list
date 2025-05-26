import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from "./components/home/home.component";
import { MenuComponent } from "./components/home/menu/menu.component";
import { InboxComponent } from "./components/inbox/inbox.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HomeComponent, MenuComponent, InboxComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'todo_list';
}
