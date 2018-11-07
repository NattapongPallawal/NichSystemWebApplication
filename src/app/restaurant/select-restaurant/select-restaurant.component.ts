import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Upload } from 'src/app/shared/services/upload';
import { DialogAddReataurant } from './dialog-add-reataurant';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
import { SystemDataService } from 'src/app/shared/services/system-data.service';
export class Restaurant {
  public owner: string;
  public phoneNumber: string;
  public picture: string;
  public promtPayID: string;
  public rating: number = 0.0;
  public restaurantName: string;
  public timeClose: string;
  public timeOpen: string;
  public about: string;
  public address: Address = new Address();
  public key: string;
}
export class Address {
  public address: string;
  public district: string;
  public latitude: number;
  public longitude: number;
  public postalCode: string;
  public province: string;
  public subDistrict: string;
}
export class User {
  public birthday: number;
  public firstName: string;
  public lastName: string;
  public personID: string;
  public phoneNumber: string;
  public picture: string;
  public address: Address2 = new Address2()
}
export class Address2 {
  public address: string;
  public district: string;
  public postalCode: string;
  public province: string;
  public subDistrict: string;
}
@Component({
  selector: 'app-select-restaurant',
  templateUrl: './select-restaurant.component.html',
  styleUrls: ['./select-restaurant.component.css']
})
export class SelectRestaurantComponent implements OnInit {

  userID: string
  restaurant = new Array<Restaurant>()
  userInfo = new User()
  constructor(private dialog: MatDialog, private auth: AuthService, private db: AngularFireDatabase, private router: Router,private dataService : SystemDataService) {
    this.userID = auth.authInfo$.getValue().$uid
    this.db.object<User>(`restaurantOwner/${this.userID}`).valueChanges().subscribe(user => {
      this.userInfo = user
    })
    db.list<Restaurant>(`restaurant/`, ref => ref.orderByChild("owner").equalTo(this.userID)).snapshotChanges().subscribe(res => {
      const restaurantTemp = new Array<Restaurant>()
      res.forEach(r => {
        const temp = r.payload.val()
        temp.key = r.payload.key
        restaurantTemp.push(temp)
      })
      this.restaurant = restaurantTemp

    })
    console.log(this.userID) 
    this.dataService.currentFormHome.subscribe(data =>{
      if(data){
        this.openDialog()
        this.dataService.changeFormHome(false)
      }
    })
    

  }

  ngOnInit() {

  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddReataurant, {
      width: '60%',
      data: this.userID
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  gotoDashbord(key: string) {
    console.log(key);
    localStorage.setItem("restaurantKey", key)
    this.router.navigate(['/home'])
  }

}