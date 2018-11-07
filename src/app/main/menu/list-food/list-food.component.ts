import { Component, OnInit } from '@angular/core';
import { Menu } from 'src/app/shared/services/Menu';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatDialog } from '@angular/material';
import { DialogAddMenu } from './dialog-add-menu';
import { DialogEditMenu } from './dialog-edit-menu';

export class EditMenu {
  public menu: Menu;
  public resKey: String;
  public menuKey: String;
}


@Component({
  selector: 'app-list-food',
  templateUrl: './list-food.component.html',
  styleUrls: ['./list-food.component.css']
})
export class ListFoodComponent implements OnInit {
  displayedColumns: string[] = ['no', 'menuName', 'price', 'type','available'];
  menus = new Array<Menu>()
  resKey: string
  menuKeys: String[] = new Array<String>()
  constructor(private db: AngularFireDatabase, private dialog: MatDialog, ) {
    this.resKey = localStorage.getItem("restaurantKey")
    db.list<Menu>(`menu/${this.resKey}`).snapshotChanges().subscribe(menu => {
      const temp = new Array<Menu>()
      this.menuKeys = new Array<String>()
      menu.forEach(m => {
        this.menuKeys.push(m.payload.key)
        temp.push(m.payload.val())
      })
      console.log(this.menuKeys)
      this.menus = temp
    })
  }

  ngOnInit() {
  }

  onClickMenu(index: number): void {
    console.log(index)
    var m: EditMenu = new EditMenu()

    m.menu = this.menus[index]
    m.menuKey = this.menuKeys[index]
    m.resKey = this.resKey
    const dialogRef = this.dialog.open(DialogEditMenu, {
      width: '75%',
      data: m
    });
  }
  onClickAddMenu(): void {
    const dialogRef = this.dialog.open(DialogAddMenu, {
      width: '60%',
      data: this.resKey
    });
  }
}
