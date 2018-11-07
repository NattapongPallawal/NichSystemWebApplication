import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NotificationsService } from 'angular2-notifications';
import { AngularFireDatabase } from '@angular/fire/database';
import { User } from '../shared/services/User';
import { AuthService } from '../shared/services/auth.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { SystemDataService } from '../shared/services/system-data.service';
import { Employee } from '../shared/services/Employee';
import { Table } from '../shared/services/Table';

export class NotificationRestaurant {
  constructor(
    public customer: string,
    public date: number,
    public message: string,
    public order: string,
    public restaurant: string,
    public fromRestaurant: Boolean,
    public read: boolean) {


  }
  public orderObj: Order;
  public customerObj: Customer;
  public key: string;
}
export class Order {
  public status: string;
  public key: string;
  public customerID: string;
  public currentStatus: number;
  public date: number;
  public dateRes: number;
  public orderNumber: number;
  public finish: boolean;
  public totalMenu: string;
  public table: string;
}
export class Customer {
  public firstName: string;
}
export class ReataurantName {
  public restaurantName: string;
  public key: string;

}
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  form: FormGroup;
  notificationRestaurant = new Array<NotificationRestaurant>()
  readNotiCount: number = 0
  types = ['alert', 'error', 'info', 'warn', 'success'];
  animationTypes = ['fromRight', 'fromLeft', 'scale', 'rotate'];
  user = new User()
  restaurantKey: string;
  resNameList: Array<ReataurantName> = [];
  resNameCurrent: string = "";
  isAdmin: boolean = true

  private _mobileQueryListener: () => void;
  owner$: BehaviorSubject<string | null>;
  constructor(changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private route: Router,
    private snackBar: MatSnackBar,
    private _notifications: NotificationsService,
    private _fb: FormBuilder,
    private db: AngularFireDatabase,
    private auth: AuthService,
    private router: Router,
    private dataService: SystemDataService

  ) {

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    ////////////////////////////////////////////////////////////////
    this.restaurantKey = localStorage.getItem("restaurantKey")
    this.isAdmin = localStorage.getItem("isAdmin") === "true"
    console.log(localStorage.getItem("restaurantKey"));
    this.getNotificationRestaurant()
    if (this.isAdmin) {
      db.object<User>(`restaurantOwner/${this.auth.authInfo$.getValue().$uid}`).valueChanges().subscribe(u => {
        this.user = u
      })
      db.list<ReataurantName>('restaurant/', ref => ref.orderByChild("owner").equalTo(`${this.auth.authInfo$.getValue().$uid}`)).snapshotChanges().subscribe(data => {
        this.resNameList = []
        data.forEach(r => {
          if (r.key == this.restaurantKey) {
            this.resNameCurrent = r.payload.val().restaurantName;
          } else {
            var res = r.payload.val()
            res.key = r.key
            this.resNameList.push(res)
          }
        })
      })

    } else {
      db.object<Employee>(`employee/${this.auth.authInfo$.getValue().$uid}`).valueChanges().subscribe(u => {
        this.user = u
      })
      db.object<ReataurantName>(`restaurant/${this.restaurantKey}`).snapshotChanges().subscribe(data => {
        this.resNameCurrent = data.payload.val().restaurantName;
      })
    }



  }
  addReataurant() {
    this.dataService.changeFormHome(true)
    this.route.navigate(['select-restaurant']);

  }
  selectRestaurant(key: string) {
    localStorage.setItem("restaurantKey", key)
    location.reload()
  }
  private getNotificationRestaurant() {
    this.db.list<NotificationRestaurant>("notificationRestaurant", ref => ref.orderByChild("restaurant").equalTo(this.restaurantKey))
      .snapshotChanges().subscribe(noti => {
        const tempNotifications = new Array<NotificationRestaurant>()
        noti.forEach(n => {
          const tempNoti = n.payload.val()
          tempNoti.key = n.payload.key
          const orderListener = this.db.object<Order>(`order/${tempNoti.order}`)
            .snapshotChanges().subscribe(order => {
              tempNoti.orderObj = order.payload.val()
              const customerListener = this.db.object<Customer>(`customer/${tempNoti.customer}`)
                .snapshotChanges().subscribe(customer => {
                  if (order.payload.val().table != null) {
                    const tableListener = this.db.object<Table>("table/" + this.restaurantKey + "/" + order.payload.val().table).valueChanges().subscribe(data => {
                      tempNoti.customerObj = customer.payload.val()
                      tempNoti.orderObj.table = data.tableName
                      tempNotifications.push(tempNoti)
                      tempNotifications.sort((a, b) => a.date > b.date ? -1 : a.date < b.date ? 1 : 0)
                      customerListener.unsubscribe()
                      orderListener.unsubscribe()
                      tableListener.unsubscribe()
                      if (noti.length == tempNotifications.length) {
                        this.readNotiCount = 0
                        var diff = tempNotifications.length - this.notificationRestaurant.length
                        if (this.notificationRestaurant.length != 0 && tempNotifications.length != this.notificationRestaurant.length) {
    
                          for (var i = 0; i < diff; i++) {
    
                            this.form = this._fb.group({
                              type: 'success',
                              title: 'มีออเดอรใหม่',
                              content: `${tempNotifications[i].message} จากคุณ ${tempNotifications[i].customerObj.firstName}`,
                              timeOut: 5000,
                              showProgressBar: true,
                              pauseOnHover: true,
                              clickToClose: true,
                              animate: 'fromRight'
                            });
                            this.createSlideNotification()
                          }
                        }
    
                        this.notificationRestaurant = tempNotifications
                        this.notificationRestaurant.forEach(noti => {
                          if (!noti.read) {
                            this.readNotiCount += 1
                          }
                        })
                      }
                    })
                  } else {
                    tempNoti.customerObj = customer.payload.val()
                    tempNotifications.push(tempNoti)
                    tempNotifications.sort((a, b) => a.date > b.date ? -1 : a.date < b.date ? 1 : 0)
                    customerListener.unsubscribe()
                    orderListener.unsubscribe()
                    if (noti.length == tempNotifications.length) {
                      this.readNotiCount = 0
                      var diff = tempNotifications.length - this.notificationRestaurant.length
                      if (this.notificationRestaurant.length != 0 && tempNotifications.length != this.notificationRestaurant.length) {

                        for (var i = 0; i < diff; i++) {

                          this.form = this._fb.group({
                            type: 'success',
                            title: 'มีออเดอรใหม่',
                            content: `${tempNotifications[i].message} จากคุณ ${tempNotifications[i].customerObj.firstName}`,
                            timeOut: 5000,
                            showProgressBar: true,
                            pauseOnHover: true,
                            clickToClose: true,
                            animate: 'fromRight'
                          });
                          this.createSlideNotification()
                        }
                      }

                      this.notificationRestaurant = tempNotifications
                      this.notificationRestaurant.forEach(noti => {
                        if (!noti.read) {
                          this.readNotiCount += 1
                        }
                      })
                    }
                  }

                  ///////////////////////////

                })
            })

        })
      })
  }

  readNotification(noti: NotificationRestaurant) {
    console.log(noti)
    this.db.list(`notificationRestaurant`).update(noti.key, { read: true })
    /* if (noti.orderObj.status != "รอการชำระเงิน") {
      this.route.navigate(['/home/order'])
    } else {
      this.route.navigate(['/home/payment'])
    } */


  }
  gotoDashbord(key: string) {
    console.log(key);
    localStorage.setItem("restaurantKey", key)
    this.router.navigate(['/home'])
  }
  ngOnInit() {

    this.form = this._fb.group({
      type: 'success',
      title: 'This is just a title',
      content: 'This is just some content',
      timeOut: 3000,
      showProgressBar: true,
      pauseOnHover: true,
      clickToClose: true,
      animate: 'fromRight'

    });
    /// let id = this.route.snapshot.paramMap.get('id');
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }


  onClickLogout() {
    this.auth.logout()

    this.snackBar.open('คุณได้ออกจากระบบแล้ว', "ตกลง", {
      duration: 3000
    });
  }
  createSlideNotification() {
    const temp = this.form.getRawValue();
    const title = temp.title;
    const content = temp.content;
    const type = temp.type;

    /* 	delete temp.title;
      delete temp.content;
      delete temp.type; */
    this._notifications.create(title, content, type, temp)
  }


}
