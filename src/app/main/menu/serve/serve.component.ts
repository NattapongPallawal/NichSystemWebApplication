import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogServeComponent } from './dialog-serve/dialog-serve.component';
import { AngularFireDatabase } from '@angular/fire/database';
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
}
export class Customer {
  public firstName: string;
  public lastName: string;
  public picture: string;
} @Component({
  selector: 'app-serve',
  templateUrl: './serve.component.html',
  styleUrls: ['./serve.component.css']
})
export class ServeComponent implements OnInit {


  orders = new Array<Order>()
  ordersTemp2 = new Array<Order>()
  show: boolean = true;
  countwaitServe: number = 0
  countDoing: number = 0
  countDone: number = 0
  onWaitServe: boolean = true
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
            if (temp.table != null) {
              const tableListener = this.fb.object<Table>("table/" + this.restaurantKey + "/" + temp.table).valueChanges().subscribe(data => {
                temp.table = data.tableName
                temp.customer = cus
                ordersTemp.push(temp)
                if (o.length == ordersTemp.length) {
                  this.orders = ordersTemp
                  this.ordersTemp2 = ordersTemp
                }
               
                this.checkStatus()
                this.calculateQueue() 
                tableListener.unsubscribe()
                customerListener.unsubscribe()
              })
            } else {
              temp.customer = cus
              ordersTemp.push(temp)
              if (o.length == ordersTemp.length) {
                this.orders = ordersTemp
                this.ordersTemp2 = ordersTemp
              }
              customerListener.unsubscribe()
              this.checkStatus()
              this.calculateQueue()
            }
           
            /* this.countwaitServe += 1 */
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
    if (this.onWaitServe) {
      this.waitServe()
    }
    /* if (this.onDoing) {
      this.doing()
    } */
    if (this.onDone) {
      this.done()
    }
  }

  ngOnInit() {
    console.log(Date.now())
  }
  calculateQueue() {
    this.countwaitServe = 0
    this.countDoing = 0
    this.countDone = 0
    this.ordersTemp2.forEach(order => {
      if (order.status === "รอเสริฟ" || order.status === "รอลูกค้ามารับ") {
        this.countwaitServe += 1
      } else if (order.status === "รอการชำระเงิน" /* && order.dateRes != null && !order.finish */) {
        this.countDone += 1
      } else { }
    })
  }
  waitServe() {
    this.orders = new Array<Order>()
    this.ordersTemp2.forEach(order => {
      if (order.status === "รอเสริฟ" || order.status === "รอลูกค้ามารับ") {
        this.orders.push(order)
      }
    })
    this.orders.sort((a, b) => a.date > b.date ? -1 : a.date < b.date ? 1 : 0)   /* x.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0) */
    this.onWaitServe = true

    this.onDone = false

  }
  /*  doing() {
     this.orders = new Array<Order>()
     this.ordersTemp2.forEach(order => {
       if (order.status === "กำลังทำ" && order.dateRes != null) {
         this.orders.push(order)
       }
     })
     this.orders.sort((a, b) => a.dateRes > b.dateRes ? -1 : a.dateRes < b.dateRes ? 1 : 0)
     this.onWaitServe = false
     this.onDoing = true
     this.onDone = false
   } */
  done() {
    this.orders = new Array<Order>()
    this.ordersTemp2.forEach(order => {
      if (order.status === "รอการชำระเงิน" /* && order.dateRes != null && !order.finish */) {
        this.orders.push(order)
      }
    })
    this.orders.sort((a, b) => a.dateRes > b.dateRes ? -1 : a.dateRes < b.dateRes ? 1 : 0)
    this.onWaitServe = false
    this.onDone = true
  }




  openDialog(order: Order): void {

    const dialogRef = this.dialog.open(DialogServeComponent, {
      width: '60%',
      data: order
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      //   this.animal = result;
    });
  }

}
