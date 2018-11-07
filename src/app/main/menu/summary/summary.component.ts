import { Component, OnInit } from '@angular/core';
import * as CanvasJS from '../.././../../assets/canvasjs-2.2/canvasjs.min';
import { MatDialog } from '@angular/material';
import { DialogFoodDayComponent } from './dialog/dialog-food-day/dialog-food-day.component';
import { DialogFoodMonthComponent } from './dialog/dialog-food-month/dialog-food-month.component';
import { DialogMoneyDayComponent } from './dialog/dialog-money-day/dialog-money-day.component';
import { DialogMoneyMonthComponent } from './dialog/dialog-money-month/dialog-money-month.component';
import { AngularFireDatabase } from '@angular/fire/database';
import { Order } from 'src/app/shared/services/Order';
import { OrderMenu } from 'src/app/shared/services/OrderMenu';
import { Observable, BehaviorSubject } from 'rxjs';

export class MenuAmount {
  public label: string;
  public y: number = 1;
}
/* export class OrderTotal {
  public label: string;
  public y: number = 1;
} */

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  chartDay: boolean;
  chartMonth: boolean;
  restaurantKey: string;
  menuAmountNow: MenuAmount[] = []
  MenuAmountMonth: MenuAmount[] = []
  MenuAmountWeek: Array<number> = [0, 0, 0, 0, 0, 0, 0]
  chartColumOfDay = new CanvasJS.Chart("chartColumOfDay", {
    animationEnabled: true,
    exportEnabled: false,
    colorSet: "greenShades",

    data: [{

      type: "column",
      dataPoints:
        [
          { y: this.MenuAmountWeek[1], label: "จันทร์" },
          { y: this.MenuAmountWeek[2], label: "อังคาร" },
          { y: this.MenuAmountWeek[3], label: "พุธ" },
          { y: this.MenuAmountWeek[4], label: "พฤหัสบดี" },
          { y: this.MenuAmountWeek[5], label: "ศุกร์" },
          { y: this.MenuAmountWeek[6], label: "เสาร์" },
          { y: this.MenuAmountWeek[0], label: "อาทิตย์" },

        ]
    }]
  });
  chartOfDay = new CanvasJS.Chart("chartOfDay", {
    theme: "light2",
    animationEnabled: true,
    exportEnabled: false,

    title: {
      text: "สรุปยอดประจำวัน"
    },
    data: [{
      type: "pie",
      showInLegend: false,
      toolTipContent: "<b>{label}</b>: {y}ออเดอร์(#percent%)",
      indexLabel: "{label} - #percent%",
      dataPoints: this.menuAmountNow

    }]
  });
  chartOfMonth = new CanvasJS.Chart("chartOfMonth", {
    theme: "light2",
    animationEnabled: true,
    exportEnabled: false,
    title: {
      text: "สรุปยอดประจำเดือน"
    },
    data: [{
      type: "pie",
      showInLegend: false,
      toolTipContent: "<b>{label}</b>: ${y} (#percent%)",
      indexLabel: "{label} - #percent%",
      dataPoints: this.MenuAmountMonth

    }]
  });
  // ready = new Observable<boolean>()
  private ready = new BehaviorSubject(false);
  currentready = this.ready.asObservable()
  constructor(public dialog: MatDialog, private fb: AngularFireDatabase) {
    this.restaurantKey = localStorage.getItem("restaurantKey")
    
    this.fb.list<Order>("/order", ref => ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`)).snapshotChanges()
      .subscribe(o => {
        this.MenuAmountWeek = [0, 0, 0, 0, 0, 0, 0]
        o.forEach(oo => {
          if (oo.payload.val().finish) {

            this.checkWeek(oo.payload.val().date)
            this.MenuAmountWeek[this.checkDayOfWeek(oo.payload.val().date)] += oo.payload.val().total

            const orderMenuListener = fb.list<OrderMenu>(`/order-menu/${oo.key}`).valueChanges()
              .subscribe(om => {
                if (this.checkDateNow(oo.payload.val().date)) {
                  this.calculateMenuAmountNow(om)
                }
                if (this.checkMonth(oo.payload.val().date)) {
                  this.calculateMenuAmountMonth(om)
                }
              
                this.menuAmountNow.sort((a, b) => a.y > b.y ? -1 : a.y < b.y ? 1 : 0)
                this.MenuAmountMonth.sort((a, b) => a.y > b.y ? -1 : a.y < b.y ? 1 : 0)
                this.chart()
                orderMenuListener.unsubscribe()
              })
              //this.chart()
          }

        })
      })
  }
  checkDayOfWeek(time: number): number {
    var date = new Date(time)
    return date.getDay()
  }
  changeFormHome(data: boolean) {
    this.ready.next(data);
  }
  calculateMenuAmountMonth(orderMenu: OrderMenu[]) {
    orderMenu.forEach(o => {
      const menuAmount = new MenuAmount()
      menuAmount.label = o.foodName
      if (this.checkMenuAmount(o, this.MenuAmountMonth) != -1) {
        this.MenuAmountMonth[this.checkMenuAmount(o, this.MenuAmountMonth)].y += 1
      } else {
        this.MenuAmountMonth.push(menuAmount)
      }
    })
  }
  calculateMenuAmountNow(orderMenu: OrderMenu[]) {
    orderMenu.forEach(o => {
      const menuAmount = new MenuAmount()
      menuAmount.label = o.foodName
      if (this.checkMenuAmount(o, this.menuAmountNow) != -1) {
        this.menuAmountNow[this.checkMenuAmount(o, this.menuAmountNow)].y += 1
      } else {
        this.menuAmountNow.push(menuAmount)
      }
    })
  }
  checkMenuAmount(orderMenu: OrderMenu, check: MenuAmount[]): number {
    for (var _i = 0; _i < check.length; _i++) {
      if (orderMenu.foodName === check[_i].label) {
        return _i
      }
    }
    return -1
  }

  checkDateNow(date: number) {
    const d = new Date(date)
    var today = new Date()
    var dateT = d.getDay() + d.getMonth() + d.getFullYear()
    var now = today.getDay() + today.getMonth() + today.getFullYear()
    if (dateT == now) {
      return true
    } else {
      return false
    }

  }
  checkMonth(date: number) {
    const d = new Date(date)
    var today = new Date()
    var dateT = d.getMonth() + d.getFullYear()
    var now = today.getMonth() + today.getFullYear()
    if (dateT == now) {
      return true
    } else {
      return false
    }

  }
  checkWeek(date: number) {
    const d = new Date(date)
    var today = new Date()
    var dateT = d.getMonth() + d.getFullYear()
    var now = today.getMonth() + today.getFullYear()
    /* console.logtoday(today.get) */

    /*  if (dateT == now) {
       return true
     } else {
       return false
     }
  */
  }
  ngOnInit() {
    var date = new Date()
    console.log(date.getDay());
    this.chartOfDay.render();
    this.chartOfMonth.render();
    this.chartColumOfDay.render();

    CanvasJS.addColorSet("greenShades",
      [//colorSet Array

        "#5E62E8",
        "#9E5EE8",
        "#E35EE8",
        "#E85EA7",
        "#E85E62"
      ]);
    let chartColumOfDay = new CanvasJS.Chart("chartColumOfDay", {
      animationEnabled: true,
      exportEnabled: false,
      colorSet: "greenShades",

      data: [{

        type: "column",
        dataPoints: [
          { y: 71, label: "จันทร์" },
          { y: 55, label: "อังคาร" },
          { y: 50, label: "พุธ" },
          { y: 65, label: "พฤหัสบดี" },
          { y: 95, label: "ศุกร์" },
          { y: 68, label: "เสาร์" },
          { y: 28, label: "อาทิตย์" },

        ]
      }]
    });

    chartColumOfDay.render();

    let chartColumOfMonth = new CanvasJS.Chart("chartColumOfMonth", {
      animationEnabled: true,
      exportEnabled: false,
      colorSet: "greenShades",

      data: [{

        type: "column",
        dataPoints: [
          { y: 71, label: "จันทร์" },
          { y: 55, label: "อังคาร" },
          { y: 50, label: "พุธ" },
          { y: 65, label: "พฤหัสบดี" },
          { y: 95, label: "ศุกร์" },
          { y: 68, label: "เสาร์" },
          { y: 28, label: "อาทิตย์" },

        ]
      }]
    });

    chartColumOfMonth.render();
  }
  chart() {
    this.chartDay = true;
    this.chartMonth = false;
    this.chartOfDay = new CanvasJS.Chart("chartOfDay", {
      theme: "light2",
      animationEnabled: true,
      exportEnabled: false,

      title: {
        text: "สรุปยอดประจำวัน"
      },
      data: [{
        type: "pie",
        showInLegend: false,
        toolTipContent: "<b>{label}</b>: {y}ออเดอร์(#percent%)",
        indexLabel: "{label} - #percent%",
        dataPoints: this.menuAmountNow

      }]
    });
    this.chartOfDay.render();
    ////////////////////////////////
    let chartOfMonth = new CanvasJS.Chart("chartOfMonth", {
      theme: "light2",
      animationEnabled: true,
      exportEnabled: false,
      title: {
        text: "สรุปยอดประจำเดือน"
      },
      data: [{
        type: "pie",
        showInLegend: false,
        toolTipContent: "<b>{label}</b>: ${y} (#percent%)",
        indexLabel: "{label} - #percent%",
        dataPoints: this.MenuAmountMonth

      }]
    });
    chartOfMonth.render();
    ////////////////////////////////
    this.chartColumOfDay = new CanvasJS.Chart("chartColumOfDay", {
      animationEnabled: true,
      exportEnabled: false,
      colorSet: "greenShades",

      data: [{

        type: "column",
        dataPoints:
          [
            { y: this.MenuAmountWeek[1], label: "จันทร์" },
            { y: this.MenuAmountWeek[2], label: "อังคาร" },
            { y: this.MenuAmountWeek[3], label: "พุธ" },
            { y: this.MenuAmountWeek[4], label: "พฤหัสบดี" },
            { y: this.MenuAmountWeek[5], label: "ศุกร์" },
            { y: this.MenuAmountWeek[6], label: "เสาร์" },
            { y: this.MenuAmountWeek[0], label: "อาทิตย์" },

          ]
      }]
    });

    this.chartColumOfDay.render();
  }
  foodDayDialog(): void {
    this.dialog.open(DialogFoodDayComponent);
  }
  foodMonthDialog(): void {
    this.dialog.open(DialogFoodMonthComponent);
  }
  moneyDayDialog(): void {
    this.dialog.open(DialogMoneyDayComponent)
  }
  moneyMonthDialog(): void {
    this.dialog.open(DialogMoneyMonthComponent)
  }
}

