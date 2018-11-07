import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { DashboardComponent } from './main/menu/dashboard/dashboard.component';
import { AuthGuard } from './shared/guard/auth.guard';
import { RestaurantInfoComponent } from './main/menu/restaurant-info/restaurant-info.component';
import { FoodIngredientsComponent } from './main/menu/food-ingredients/food-ingredients.component';
import { ListFoodComponent } from './main/menu/list-food/list-food.component';
import { OrderHistoryComponent } from './main/menu/order-history/order-history.component';
import { PaymentComponent } from './main/menu/payment/payment.component';
import { ServeComponent } from './main/menu/serve/serve.component';
import { SummaryComponent } from './main/menu/summary/summary.component';
import { TableManagementComponent } from './main/menu/table-management/table-management.component';
import { OrderComponent } from './main/menu/order/order.component';
import { EmployeeAccessComponent } from './main/management/employee-access/employee-access.component';
import { PersonalInfoComponent } from './main/management/personal-info/personal-info.component';
import { SignInComponent } from './login/sign-in/sign-in.component';
import { RegisterComponent } from './login/register/register.component';
import { SelectRestaurantComponent } from './restaurant/select-restaurant/select-restaurant.component';
import { AddRestaurantComponent } from './restaurant/add-restaurant/add-restaurant.component';

const routes: Routes = [
  {
    path: 'home', component: MainComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'restaurant-info', component: RestaurantInfoComponent, canActivate: [AuthGuard] },
      { path: 'food-ingredients', component: FoodIngredientsComponent, canActivate: [AuthGuard] },
      { path: 'list-food', component: ListFoodComponent, canActivate: [AuthGuard] },
      { path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard] },
      { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
      { path: 'serve', component: ServeComponent, canActivate: [AuthGuard] },
      { path: 'summary', component: SummaryComponent, canActivate: [AuthGuard] },
      { path: 'table-management', component: TableManagementComponent, canActivate: [AuthGuard] },
      { path: 'order', component: OrderComponent, canActivate: [AuthGuard] },
      { path: 'employee-access', component: EmployeeAccessComponent, canActivate: [AuthGuard] },
      { path: 'personal-info', component: PersonalInfoComponent, canActivate: [AuthGuard] },
      { path: '', redirectTo: '/home/dashboard', pathMatch: 'full' }

    ]
  },
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'select-restaurant', component: SelectRestaurantComponent, canActivate: [AuthGuard] },
  { path: 'add-restaurant', component: AddRestaurantComponent, canActivate: [AuthGuard] }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
