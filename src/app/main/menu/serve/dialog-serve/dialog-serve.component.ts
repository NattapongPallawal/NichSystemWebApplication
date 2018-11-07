import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { error } from 'util';
import { Observable } from 'rxjs';
import { DataSnapshot, AngularFireAction, DatabaseSnapshot } from '@angular/fire/database/interfaces';
import { Timestamp } from 'rxjs/Rx';

export class Menu {
  public key: string;
  public finish: boolean;
  public foodName: string;
}
export class Order {
  public status: string;
  public key: string;
  public customerID: string;
  public customer: Customer;
  public currentStatus: number;
  public date: number;
  public dateRes: number;
  public orderNumber: number;
  public finish: boolean;
  public table: string;
  public fromRestaurant: boolean;

}
export class Customer {
  public firstName: string;
  public lastName: string;
  public picture: string;
}
export class NotificationCustomer {
  constructor(
    public customer: string,
    public date: number,
    public message: string,
    public order: string,
    public orderNumber: number,
    public restaurant: string,
    public restaurantName: string,
    public read: boolean = false, ) { }

}
@Component({
  selector: 'app-dialog-serve',
  templateUrl: './dialog-serve.component.html',
  styleUrls: ['./dialog-serve.component.css']
})
export class DialogServeComponent {
  displayedColumns = ['position', 'menu', 'size', 'amount'];
  menus = new Array<Menu>()
  dataSource = new MatTableDataSource<Menu>();
  selection = new SelectionModel<Menu>(true, []);
  menuListenet: Observable<AngularFireAction<DatabaseSnapshot<Menu>>[]>
  isDoing: boolean = false
/*   isAllDone: boolean = false */
  conutDone: number = 0
  restaurantKey: string;
  restaurantName: string;
  @Output() showTooltip: EventEmitter<any> = new EventEmitter();
  constructor(public dialogRef: MatDialogRef<DialogServeComponent>, private fb: AngularFireDatabase,
    @Inject(MAT_DIALOG_DATA) public order: Order) {
    this.restaurantKey = localStorage.getItem("restaurantKey")
    this.menuListenet = fb.list<Menu>("/order-menu/" + order.key).snapshotChanges()
    this.menuListenet.subscribe(menus => {
      this.conutDone = 0;
      this.menus = new Array<Menu>()
      this.dataSource = new MatTableDataSource<Menu>(this.menus);
      menus.forEach(menu => {
        const temp: Menu = menu.payload.val()
        temp.key = menu.key
        if (temp.finish) {
          this.conutDone += 1;
        }
        this.menus.push(temp)
      })
      if (order.status === "รอเสริฟ") {
        this.displayedColumns = ['position', 'menu', 'size', 'amount'];
        this.isDoing = true
        /* if (this.menus.length == this.conutDone) {
          this.isAllDone = true
        } */
      } else if (order.status === "รอเสริฟ") {
        this.displayedColumns = ['position', 'menu', 'size', 'amount'];
      }
    })
    fb.object<string>("/restaurant/" + this.restaurantKey + "/restaurantName").valueChanges().subscribe(resName => {
      this.restaurantName = resName
    })

  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  foodDone(row: Menu) {
    console.log("row" + row.key)
    //this.selection.select(row)
    this.fb.list("/order-menu/" + this.order.key).update(row.key, { finish: true })
  }
  doneAll() {
    this.dataSource.data.forEach(row => {
      //this.selection.select(row)
      this.fb.list("/order-menu/" + this.order.key).update(row.key, { finish: true })
    });
  }
  convertDate(date: number) {
    const d = new Date(date)
    const dd = d.getDay()
    const mm = d.getMonth()
    const yyyy = d.getFullYear() + 543
    const hh = d.getHours()
    const MM = d.getMinutes()
    var ddStr: string;
    var mmStr: string;
    var MMStr: string;
    var hhStr: string;

    if (dd < 10) {
      ddStr = "0" + dd;
    } else {
      ddStr = dd.toString();
    }
    if (mm < 10) {
      mmStr = "0" + mm;
    } else {
      mmStr = mm.toString();
    }
    if (hh < 10) {
      hhStr = "0" + hh
    } else {
      hhStr = hh.toString()
    }
    if (MM < 10) {
      MMStr = "0" + MM
    } else {
      MMStr = MM.toString()
    }
    return `${ddStr}/${mmStr}/${yyyy} ${hhStr}:${MMStr} น.`

  }
  onClickServe() {
    this.doneAll()
    /* if (this.isAllDone) { */
    if (this.order.fromRestaurant) {
      this.fb.list("/order", ref => ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`))
        .update(this.order.key, { status: "รอการชำระเงิน", currentStatus: this.order.currentStatus + 1, dateRes: Date.now() })
        .then(_ => {
          const message = `เสริฟเรียบร้อย \nสถานะตอนนี้คือ : รอการชำระเงิน `
          var notiCuse = new NotificationCustomer(this.order.customerID, Date.now(), message, this.order.key, this.order.orderNumber, this.restaurantKey, this.restaurantName)
          this.fb.list<NotificationCustomer>("/notificationCustomer").push(notiCuse)
        })
        .then(a => {
          this.dialogRef.close();
        })
    } else {
      this.fb.list("/order", ref => ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`))
        .update(this.order.key, {
          finish: true, status: "เสร็จเรียบร้อย", currentStatus: this.order.currentStatus + 1, dateRes: Date.now()
        })
        .then(_ => {
          const message = `เสริฟเรียบร้อย \nสถานะตอนนี้คือ : เสร็จเรียบร้อย `
          var notiCuse = new NotificationCustomer(this.order.customerID, Date.now(), message, this.order.key, this.order.orderNumber, this.restaurantKey, this.restaurantName)
          this.fb.list<NotificationCustomer>("/notificationCustomer").push(notiCuse)
        })
        .then(a => {
          this.dialogRef.close();
        })
    }
    /*  } else {
       alert("ต้องทำอาหารทั้งหมดให้เสร็จก่อน")
     } */
  }
}
