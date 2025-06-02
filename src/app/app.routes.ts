import { Routes } from '@angular/router';
import { InboxComponent } from './components/inbox/inbox.component';
import { HomeComponent } from './components/home/home.component';
import { CategoryComponent } from './components/category/category.component';


export const routes: Routes = [
    {path: '', redirectTo:'/home', pathMatch:'full'},
    {path:'home', component:HomeComponent},
    {path:'inbox', component:InboxComponent},
    {path: 'category/:id', component:CategoryComponent}
];
