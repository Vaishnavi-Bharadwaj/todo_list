import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { DUMMY_MENU_LIST } from '../dummy-menu-list';
import { Router } from '@angular/router';
import { ListComponent } from './list/list.component';
@Component({
  selector: 'app-menu',
  imports: [ListComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit{
  menu_list=DUMMY_MENU_LIST;
  selected!:boolean;
  isNew!:boolean;
  isAddingTask:boolean=false;
  isDropDown!:boolean;
  openDropdownId: string | null = null;
  selectedCategoryId: string | null = null;
  originalMenuIds: Set<string> = new Set();
  @Input({required:true}) category!: {
    menu_id:string;
    name:string;
    icon:string;
    path:string;
  }

  @Output() select=new EventEmitter();

  constructor(private router:Router) {
    
  }

  ngOnInit() {
    const savedMenu = localStorage.getItem('menu_list');
    if (savedMenu) {
      this.menu_list = JSON.parse(savedMenu);
    }

    else {
      this.menu_list = []; // Initialize to empty list if nothing in storage
    }

    for(const menu of DUMMY_MENU_LIST)
    {
      this.originalMenuIds.add(menu.menu_id);
    }
  }

  @HostListener('document:click')
  handleOutsideClick() {
    this.openDropdownId = null;
  }

  onSelectMenu(path:string)
  {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  onStartAddList()
  {
    this.isAddingTask=true;
  }

  onCancelAddList()
  {
    this.isAddingTask=false;
  }

  onAddList(data: { name: string }) 
  {
    const newItem = {
      menu_id: ('m'+(this.menu_list.length + 1)).toString(),
      name: data.name,
      icon: 'menu-icon1.png',
      path: '/category',
    };
    this.isNew= true;
    this.menu_list.push(newItem);
    this.saveMenu();
    this.isAddingTask = false;
    this.router.navigate(['/home'])
  }

  saveMenu()
  {
     localStorage.setItem('menu_list', JSON.stringify(this.menu_list));
  }

  onDeleteMenu(menu_id:string)
  {
    this.menu_list=this.menu_list.filter((menu)=>menu.menu_id!==menu_id)
    this.saveMenu();

    // Remove corresponding tasks from taskMap in localStorage
    const taskMapStr = localStorage.getItem('task_map');
    if (taskMapStr) {
      const taskMap: { [key: string]: any } = JSON.parse(taskMapStr);
      delete taskMap[menu_id]; // Remove tasks of deleted category
      localStorage.setItem('task_map', JSON.stringify(taskMap));
    }

    // Close dropdown if it's the deleted one
    if (this.openDropdownId === menu_id) {
      this.openDropdownId = null;
    }
    this.router.navigate(['/home'])
  }

  toggleDropdown(menu_id: string) {
    this.openDropdownId = this.openDropdownId === menu_id ? null : menu_id;
  }

  onSelectCategory(menu_id:string)
  {
    this.selectedCategoryId = menu_id;
    this.select.emit(menu_id);
    this.router.navigate(['/category', menu_id]);
  }
}
