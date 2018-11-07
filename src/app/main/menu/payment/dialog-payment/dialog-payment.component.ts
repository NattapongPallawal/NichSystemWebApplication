import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { error } from 'util';
import { Observable } from 'rxjs';
import { DataSnapshot, AngularFireAction, DatabaseSnapshot } from '@angular/fire/database/interfaces';
import { Timestamp } from 'rxjs/Rx';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';

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
  public tableKey: string;
  public total: number;
  public paymentType: string;
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
  selector: 'app-dialog-payment',
  templateUrl: './dialog-payment.component.html',
  styleUrls: ['./dialog-payment.component.css']
})
export class DialogPaymentComponent {
  displayedColumns = ['position', 'menu', 'size', 'amount', 'price'];
  menus = new Array<Menu>()
  dataSource = new MatTableDataSource<Menu>();
  menuListenet: Observable<AngularFireAction<DatabaseSnapshot<Menu>>[]>
  restaurantKey: string;
  receiveMoney: number = 0;
  change: number = 0;
  checkCalculater = false;
  restaurantName = ''
  @Output() showTooltip: EventEmitter<any> = new EventEmitter();
  constructor(public dialogRef: MatDialogRef<DialogPaymentComponent>, private fb: AngularFireDatabase, private auth: AngularFireAuth,
    @Inject(MAT_DIALOG_DATA) public order: Order) {
    this.restaurantKey = localStorage.getItem("restaurantKey")
    this.menuListenet = fb.list<Menu>("/order-menu/" + order.key).snapshotChanges()
    this.menuListenet.subscribe(menus => {
      this.menus = new Array<Menu>()
      this.dataSource = new MatTableDataSource<Menu>(this.menus);
      menus.forEach(menu => {
        const temp: Menu = menu.payload.val()
        temp.key = menu.key
        this.menus.push(temp)
      })


    })
    fb.object<string>("/restaurant/" + this.restaurantKey + "/restaurantName").valueChanges().subscribe(resName => {
      this.restaurantName = resName
    })
    if (this.order.paymentType === 'promtpay') {
      this.receiveMoney = this.order.total
    }

    this.change = this.receiveMoney - this.order.total

  }

  calculate(number: any, check: boolean = false) {
    if (check) {
      this.checkCalculater = check
    }

    if (this.checkCalculater) {
      this.receiveMoney += parseFloat(number);
    } else {
      var temp: any = `${this.receiveMoney}${number}`
      this.receiveMoney = parseFloat(temp)
    }
    this.change = this.receiveMoney - this.order.total

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
  onClickPayed() {
    if (this.order.fromRestaurant) {
      var countOrder: number = 0
      this.fb.list<Order>("/order", ref => ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`)).valueChanges().subscribe(data => {
        countOrder = 0
        data.forEach(d => {
          if (d.customerID == this.order.customerID && !d.finish && d.table != null) {
            countOrder++
          }
        })
        console.log(this.order.tableKey != null);
        console.log(countOrder);


        if (countOrder == 1 && this.order.tableKey != null) {
          this.fb.list("/table/" + this.restaurantKey)
            .update(this.order.tableKey, { available: true, customerID: null })


        } else {

        }
      })

      this.fb.list("/order", ref => ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`))
        .update(this.order.key, { finish: true, status: "เสร็จเรียบร้อย", currentStatus: this.order.currentStatus + 1, dateRes: Date.now() })
        .then(_ => {
          const message = `ยินดีให้บริการ ไว้กลับมาอุดหนุนอีกน้า \nสถานะตอนนี้คือ : เสร็จเรียบร้อย `
          var notiCuse = new NotificationCustomer(this.order.customerID, Date.now(), message, this.order.key, this.order.orderNumber, this.restaurantKey, this.restaurantName)
          this.fb.list<NotificationCustomer>("/notificationCustomer").push(notiCuse)
        })
        .then(a => {
          this.dialogRef.close();
        })

    } else {

      this.fb.list("/order", ref => ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`))
        .update(this.order.key, { status: "รอรับออเดอร์", currentStatus: this.order.currentStatus + 1, dateRes: Date.now() })
        .then(_ => {
          const message = `สำเร็จ ! เช็คยอดเงินเรียบร้อย  \nสถานะตอนนี้คือ : รอรับออเดอร์ `
          var notiCuse = new NotificationCustomer(this.order.customerID, Date.now(), message, this.order.key, this.order.orderNumber, this.restaurantKey, this.restaurantName)
          this.fb.list<NotificationCustomer>("/notificationCustomer").push(notiCuse)
        })
        .then(a => {
          this.dialogRef.close();
        })
    }
  }
}
