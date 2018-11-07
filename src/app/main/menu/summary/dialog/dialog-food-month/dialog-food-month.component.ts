import { Component, OnInit } from '@angular/core';

export interface PeriodicElement {
  nameFood: string;
  position: number;
  amountMenu: number;
 
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, nameFood: 'ตำปลาร้า', amountMenu: 5000 },
  {position: 2, nameFood: 'ตำปลาแดก', amountMenu: 400 },
  {position: 3, nameFood: 'ตำไทย', amountMenu: 260 },
  {position: 4, nameFood: 'ปลาร้า', amountMenu: 122},
  
];

@Component({
  selector: 'app-dialog-food-month',
  templateUrl: './dialog-food-month.component.html',
  styleUrls: ['./dialog-food-month.component.css']
})
export class DialogFoodMonthComponent implements OnInit {
  displayedColumns: string[] = ['position', 'nameFood', 'amountMenu'];
  dataSource = ELEMENT_DATA;
  constructor() { }

  ngOnInit() {
  }

}
