import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainComponent } from './main/main.component';
import { DashboardComponent } from './main/menu/dashboard/dashboard.component';
import { RestaurantInfoComponent } from './main/menu/restaurant-info/restaurant-info.component';
import { OrderComponent, DialogOrder } from './main/menu/order/order.component';
import { DialogAddReataurant } from './restaurant/select-restaurant/dialog-add-reataurant';
import { FoodIngredientsComponent } from './main/menu/food-ingredients/food-ingredients.component';
import { ListFoodComponent } from './main/menu/list-food/list-food.component';
import { OrderHistoryComponent } from './main/menu/order-history/order-history.component';
import { PaymentComponent } from './main/menu/payment/payment.component';
import { ServeComponent } from './main/menu/serve/serve.component';
import { TableManagementComponent } from './main/menu/table-management/table-management.component';
import { SummaryComponent } from './main/menu/summary/summary.component';
import { PersonalInfoComponent } from './main/management/personal-info/personal-info.component';
import { EmployeeAccessComponent, AddEmployeeDialog } from './main/management/employee-access/employee-access.component';
import { SignInComponent } from './login/sign-in/sign-in.component';
import { RegisterComponent } from './login/register/register.component';
import { SelectRestaurantComponent } from './restaurant/select-restaurant/select-restaurant.component';
import { AddRestaurantComponent } from './restaurant/add-restaurant/add-restaurant.component';
import { DialogAddMenu } from './main/menu/list-food/dialog-add-menu';
import { DialogEditMenu } from './main/menu/list-food/dialog-edit-menu';
import { DialogServeComponent } from './main/menu/serve/dialog-serve/dialog-serve.component';
import { DialogPaymentComponent } from './main/menu/payment/dialog-payment/dialog-payment.component';
import { DialogFoodDayComponent } from './main/menu/summary/dialog/dialog-food-day/dialog-food-day.component';
import { DialogFoodMonthComponent } from './main/menu/summary/dialog/dialog-food-month/dialog-food-month.component';
import { DialogMoneyDayComponent } from './main/menu/summary/dialog/dialog-money-day/dialog-money-day.component';
import { DialogMoneyMonthComponent } from './main/menu/summary/dialog/dialog-money-month/dialog-money-month.component';
import { DialogRemoveEmployeeComponent } from './main/management/employee-access/dialog-remove-employee/dialog-remove-employee.component';
import { QrcodeDialogComponent } from './main/menu/table-management/qrcode-dialog/qrcode-dialog.component';
import { MatInputModule, MatButtonModule, MatCardModule, MatDividerModule, MatListModule, MatIconModule, MatStepperModule, MatToolbarModule, MatSidenavModule, MatBadgeModule, MatMenuModule, MatTableModule, MatCheckboxModule, MatPaginatorModule, MatExpansionModule, MatButtonToggleModule, MatDialogModule, MatRadioModule, MatSelectModule, MatAutocompleteModule, MatGridListModule, MatSnackBarModule, MatDatepickerModule, MatRippleModule, MatTooltipModule, MatSlideToggleModule, MatChipsModule, MatProgressSpinnerModule, MatNativeDateModule, MatProgressBarModule } from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AuthGuard } from './shared/guard/auth.guard';
import { AuthService } from './shared/services/auth.service';
import { UploadService } from './shared/services/upload.service';
import { SystemDataService } from './shared/services/system-data.service';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule   } from '@angular/fire/firestore';
import { QRCodeModule } from 'angularx-qrcode';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    DashboardComponent,
    RestaurantInfoComponent,
    OrderComponent,
    DialogOrder,
    DialogAddReataurant,
    FoodIngredientsComponent,
    ListFoodComponent,
    OrderHistoryComponent,
    PaymentComponent,
    ServeComponent,
    TableManagementComponent,
    SummaryComponent,
    PersonalInfoComponent,
    EmployeeAccessComponent,
    SignInComponent,
    RegisterComponent,
    SelectRestaurantComponent,
    AddRestaurantComponent,
    DialogAddMenu,
    DialogEditMenu,
    AddEmployeeDialog,
    DialogServeComponent,
    DialogPaymentComponent,
    DialogFoodDayComponent,
    DialogFoodMonthComponent,
    DialogMoneyDayComponent,
    DialogMoneyMonthComponent,
    DialogRemoveEmployeeComponent,
    QrcodeDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatStepperModule,
    MatToolbarModule,
    MatSidenavModule,
    MatBadgeModule,
    MatMenuModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatTableModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatRadioModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatGridListModule,
    MatSnackBarModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatTooltipModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsKey
    }),
    //LottieAnimationViewModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    MatProgressBarModule,
    SimpleNotificationsModule.forRoot(),
    MatNativeDateModule,
    MatProgressSpinnerModule,
   // StarRatingModule.forRoot(),
    FormsModule,
    MatChipsModule,
    QRCodeModule,
    MatSlideToggleModule
  ],
  entryComponents: [
    DialogOrder,
    DialogAddReataurant,
    DialogAddMenu,
    DialogEditMenu,
    AddEmployeeDialog,
    ServeComponent,
    DialogServeComponent,
    DialogPaymentComponent,
    DialogFoodDayComponent,
    DialogFoodMonthComponent,
    DialogMoneyDayComponent,
    DialogMoneyMonthComponent,
    DialogRemoveEmployeeComponent,
    QrcodeDialogComponent
  ],
  providers: [AuthGuard, AuthService,UploadService,SystemDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
