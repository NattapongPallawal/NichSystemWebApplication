import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { error } from 'util';
import { Observable } from 'rxjs';
import { DataSnapshot, AngularFireAction, DatabaseSnapshot } from '@angular/fire/database/interfaces';
import { Timestamp } from 'rxjs/Rx';
import { Table } from 'src/app/shared/services/Table';
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
  public totalMenu: number;
  public total: number;
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
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
  providers: [AngularFireDatabase]
})
export class OrderComponent implements OnInit {

  orders = new Array<Order>()
  ordersTemp2 = new Array<Order>()
  show: boolean = true;
  countWaitQueue: number = 0

  countDoing: number = 0
  countDone: number = 0
  onWaitQueue: boolean = true
  onDoing: boolean = false
  onDone: boolean = false
  restaurantKey: string;
  constructor(private fb: AngularFireDatabase, private dialog: MatDialog) {
    this.restaurantKey = localStorage.getItem("restaurantKey")
    fb.list<Order>("/order", ref => ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`)).snapshotChanges().subscribe(o => {
      const ordersTemp = new Array<Order>()
      o.forEach(order => {
        const temp = order.payload.val()
        temp.key = order.key

        const customerListener = this.fb.object<Customer>("customer/" + temp.customerID).valueChanges().subscribe(
          cus => {
            temp.customer = cus
            if (temp.table != null) {
              const tableListener = this.fb.object<Table>("table/" + this.restaurantKey + "/" + temp.table).valueChanges().subscribe(data => {
                temp.table = data.tableName
                ordersTemp.push(temp)
                if (o.length == ordersTemp.length) {
                  this.orders = ordersTemp
                  this.ordersTemp2 = ordersTemp
                }
                tableListener.unsubscribe()
                customerListener.unsubscribe()
                this.checkStatus()                
                this.calculateQueue()
              })
            } else {
              ordersTemp.push(temp)
              if (o.length == ordersTemp.length) {
                this.orders = ordersTemp
                this.ordersTemp2 = ordersTemp
              }
              customerListener.unsubscribe()
              this.checkStatus()
              this.calculateQueue()
              /* this.countWaitQueue += 1 */
            }
          },
          error => {
            // temp.customer = new Customer()
            console.log("Error : " + error)
            // customerListener.unsubscribe()
            // this.ordersTemp.push(temp)
            //  this.orders = this.ordersTemp
            // this.checkStatus()
            // this.calculateQueue()
          })
      })

    })

  }
  checkStatus() {
    if (this.onWaitQueue) {
      this.waitQueue()
    }
    if (this.onDoing) {
      this.doing()
    }
    if (this.onDone) {
      this.done()
    }
  }

  ngOnInit() {
    console.log(Date.now())
  }
  calculateQueue() {
    this.countWaitQueue = 0
    this.countDoing = 0
    this.countDone = 0
    this.ordersTemp2.forEach(order => {
      if (order.status === "รอรับออเดอร์") {
        this.countWaitQueue += 1
      } else if (order.status === "กำลังทำ") {
        this.countDoing += 1
      } else if (order.status === "รอเสริฟ") {
        this.countDone += 1
      } else { }
    })
  }
  waitQueue() {
    this.orders = new Array<Order>()
    this.ordersTemp2.forEach(order => {
      if (order.status === "รอรับออเดอร์") {
        this.orders.push(order)
      }
    })
    this.orders.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)   /* x.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0) */
    this.onWaitQueue = true
    this.onDoing = false
    this.onDone = false
  }
  doing() {
    this.orders = new Array<Order>()
    this.ordersTemp2.forEach(order => {
      if (order.status === "กำลังทำ" && order.dateRes != null) {
        this.orders.push(order)
      }
    })
    this.orders.sort((a, b) => a.dateRes < b.dateRes ? -1 : a.dateRes > b.dateRes ? 1 : 0)
    this.onWaitQueue = false
    this.onDoing = true
    this.onDone = false
  }
  done() {
    this.orders = new Array<Order>()
    this.ordersTemp2.forEach(order => {
      if (order.status === "รอเสริฟ" && order.dateRes != null/*  && !order.finish */) {
        this.orders.push(order)
      }
    })
    this.orders.sort((a, b) => a.dateRes < b.dateRes ? -1 : a.dateRes > b.dateRes ? 1 : 0)
    this.onWaitQueue = false
    this.onDoing = false
    this.onDone = true
  }
  openDialog(order: Order): void {

    const dialogRef = this.dialog.open(DialogOrder, {
      width: '60%',
      data: order
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      //   this.animal = result;
    });
  }
}

export class Menu {
  public key: string;
  public finish: boolean;
  public foodName: string;
  public amount: number;
  public price: number;
}

@Component({
  selector: 'dialog-rder',
  templateUrl: './dialog-order.html',
  styleUrls: ['./order.component.css'],
  providers: [AngularFireDatabase]
})
export class DialogOrder {
  displayedColumns = ['select', 'position', 'menu', 'size', 'amount'];
  menus = new Array<Menu>()
  dataSource = new MatTableDataSource<Menu>();
  selection = new SelectionModel<Menu>(true, []);
  menuListenet: Observable<AngularFireAction<DatabaseSnapshot<Menu>>[]>
  isDoing: boolean = false
  isAllDone: boolean = false
  conutDone: number = 0
  restaurantName: string
  restaurantKey: string;
  @Output() showTooltip: EventEmitter<any> = new EventEmitter();
  constructor(public dialogRef: MatDialogRef<DialogOrder>, private fb: AngularFireDatabase,
    @Inject(MAT_DIALOG_DATA) public order: Order) {
    this.restaurantKey = localStorage.getItem("restaurantKey")
    this.menuListenet = fb.list<Menu>("/order-menu/" + order.key).snapshotChanges()
    this.menuListenet.subscribe(menus => {
      this.conutDone = 0;
      this.menus = new Array<Menu>()
      menus.forEach(menu => {
        const temp: Menu = menu.payload.val()
        temp.key = menu.key
        if (temp.finish) {
          this.conutDone += 1;
        }
        this.menus.push(temp)
        this.dataSource.data = this.menus
        this.dataSource.data.forEach(d => {
          this.selection.select(d)
        })
      })
      if (order.status === "กำลังทำ") {
        this.displayedColumns = ['position', 'menu', 'size', 'amount', "finish"];
        this.isDoing = true

        if (this.menus.length == this.conutDone) {
          this.isAllDone = true
        }
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
  /*  closeDialog(): void {
      this.dialogRef.close();
    } */
  getOrder() {
    console.log(this.selection.selected);
    const temp = this.menus;
    const tempSelect = this.selection.selected;
    var cantDo = "\n";
    var che = true;
    temp.forEach(menu => {
      if (tempSelect.indexOf(menu) != -1) {
        this.fb.list("/order-menu/" + this.order.key).update(menu.key, { canDo: true })
      } else {

        this.fb.list("/order-menu/" + this.order.key + "/" + menu.key).remove()
        this.fb.list("/order/").update(this.order.key, { totalMenu: this.order.totalMenu - 1, total: this.order.total - (menu.price * menu.amount) })

        if (che) {
          cantDo = cantDo + `รายการอาหารที่ไม่สามารถทำได้ : ${menu.foodName}`
          che = false
        } else {
          cantDo = cantDo + `, ${menu.foodName}`
        }

      }
    })
    this.fb.list("/order", ref => ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`))
      .update(this.order.key, { status: "กำลังทำ", currentStatus: this.order.currentStatus + 1, dateRes: Date.now() }).then(_ => {

      }).then(_ => {
        const message = `รับออเดอร์ของคุณเรียบร้อยแล้ว \nสถานะตอนนี้คือ : กำลังทำ${cantDo} `
        var notiCuse = new NotificationCustomer(
          this.order.customerID,
          Date.now(),
          message,
          this.order.key,
          this.order.orderNumber,
          `${this.restaurantKey}`,
          this.restaurantName)
        this.fb.list<NotificationCustomer>("/notificationCustomer").push(notiCuse)
      }).then(_ => {
        this.dialogRef.close();
      })

  }
  foodDone(row: Menu) {
    console.log("row" + row.key);
    //this.selection.select(row)
    this.fb.list("/order-menu/" + this.order.key).update(row.key, { finish: true });
  }
  doneAll() {
    this.dataSource.data.forEach(row => {
      //this.selection.select(row)
      this.fb.list("/order-menu/" + this.order.key).update(row.key, { finish: true });
    });
  }
  convertDate(date: number) {
    return `${new Date(date).toLocaleString('th-TH', { timeZone: 'UTC' })} น.`
  }
  onClickServe() {
    /*  this.doneAll() */
    if (this.isAllDone) {
      this.fb.list("/order", ref => ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`))
        .update(this.order.key,
          {
            status: `${this.order.fromRestaurant ? "รอเสริฟ" : "รอลูกค้ามารับ"}`,
            finish: false,
            currentStatus: this.order.currentStatus + 1,
            dateRes: Date.now()
          }
        )
        .then(_ => {
          const message = `เย้ๆ อาหารของคุณทำเสร็จแล้ว \nสถานะตอนนี้คือ : ${this.order.fromRestaurant ? "รอเสริฟ" : "รอลูกค้ามารับ"} `
          var notiCuse = new NotificationCustomer(
            this.order.customerID,
            Date.now(),
            message,
            this.order.key,
            this.order.orderNumber,
            `${this.restaurantKey}`,
            this.restaurantName)
          this.fb.list<NotificationCustomer>("/notificationCustomer").push(notiCuse)
        })
        .then(a => {
          this.dialogRef.close();
        })
    } else {
      alert("ต้องทำอาหารทั้งหมดให้เสร็จก่อน")
    }
  }
}
