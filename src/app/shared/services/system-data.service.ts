import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Employee } from './Employee';

@Injectable({
  providedIn: 'root'
})
export class SystemDataService {
  private formHome = new BehaviorSubject(false);
  currentFormHome = this.formHome.asObservable();

  private employee = new BehaviorSubject(null);
  currentEmployee = this.employee.asObservable();

  constructor() { }

  changeFormHome(data: boolean) {
    this.formHome.next(data);
  }
  changeEmployee(data: Employee) {
    this.employee.next(data);
  }
}
