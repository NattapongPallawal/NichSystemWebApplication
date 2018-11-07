import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material';
import { AngularFireDatabase } from '@angular/fire/database';

import { OrderMenu } from 'src/app/shared/services/OrderMenu';
import { Table } from '../table-management/table-management.component';
import { FormControl } from '@angular/forms';
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
  public menus: Array<OrderMenu>;
}
export class Customer {
  public firstName: string;
  public lastName: string;
  public picture: string;
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  panelOpenState = false;
  // MatPaginator Inputs
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageEvent: PageEvent;
  displayedColumns: string[] = ['position', 'menu', 'amount', 'price'];
  startDate = new Date()
  endDate = new Date()
  orders = new Array<Order>()
  ordersShow = new Array<Order>()
  restaurantKey: string;
  startDateFilter = (d: Date): boolean => {

    const date = new Date(this.startDate).getTime()
    // const day = d.getDay();

    // Prevent Saturday and Sunday from being selected.
    return d.getTime() <= this.endDate.getTime() // day !== 0 && day !== 6;
  }
  endDateFilter = (d: Date): boolean => {
    const dateNow = new Date().getTime()
    const date = new Date(d).getTime()
    const day = d.getDay();
    // this.startDate = this.endDate

    // Prevent Saturday and Sunday from being selected.
    return date <= dateNow // day !== 0 && day !== 6;
  }
  constructor(private fb: AngularFireDatabase) {

    this.restaurantKey = localStorage.getItem("restaurantKey")
    fb.list<Order>("/order", ref =>
      ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`)
       /*  .orderByChild("finish").equalTo(true) */)
      .snapshotChanges().subscribe(o => {
        const ordersTemp = new Array<Order>()
        o.forEach(order => {
          if (order.payload.val().finish) {
            const temp = order.payload.val()
            temp.key = order.key
            const customerListener = this.fb.object<Customer>("customer/" + temp.customerID).valueChanges().subscribe(
              cus => {
                temp.customer = cus
                customerListener.unsubscribe()
                const menusListener = this.fb.list<OrderMenu>("order-menu/" + temp.key).valueChanges().subscribe(
                  menus => {
                    if (temp.table != null) {
                      const tableListener = this.fb.object<Table>("table/" + this.restaurantKey + "/" + temp.table).valueChanges().subscribe(data => {
                        temp.menus = menus
                        temp.table = data.tableName
                        ordersTemp.push(temp)
                        this.orders = ordersTemp
                        this.orders.sort((a, b) => a.date > b.date ? -1 : a.date < b.date ? 1 : 0)
                        this.onClickOK()
                        tableListener.unsubscribe()
                        menusListener.unsubscribe()
                      })
                    } else {
                      temp.menus = menus
                      ordersTemp.push(temp)
                      this.orders = ordersTemp
                      this.orders.sort((a, b) => a.date > b.date ? -1 : a.date < b.date ? 1 : 0)
                      this.onClickOK()
                      menusListener.unsubscribe()
                    }
                    

                  })
              },
              error => {
                customerListener.unsubscribe()
              })
          }
        })
      })

  }
  onClickOK() {
    this.ordersShow = []
    this.orders.forEach(order => {
      if (this.checkOrderDate(order.date)) {
        this.ordersShow.push(order)
        this.ordersShow.length
      }

    })
  }
  checkOrderDate(d: number): boolean {
    const date = new Date(d)
    const dateCheck = parseInt((`${date.getDate()}${date.getMonth()}${date.getFullYear()}`))
    const dateS = parseInt((`${this.startDate.getDate()}${this.startDate.getMonth()}${this.startDate.getFullYear()}`))
    const dateE = parseInt((`${this.endDate.getDate()}${this.endDate.getMonth()}${this.endDate.getFullYear()}`))

    if (dateCheck >= dateS && dateCheck <= dateE) {
      return true
    }
    return false
  }
  ngOnInit() {
  }
  setPageSizeOptions(setPageSizeOptionsInput: string) {
    this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
  }


}

