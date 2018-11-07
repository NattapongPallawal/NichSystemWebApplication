import { Component } from '@angular/core';

import { SelectionModel } from '@angular/cdk/collections';

import { MatTableDataSource } from '@angular/material';
import { AngularFireDatabase } from '@angular/fire/database';
import { Menu } from 'src/app/shared/services/Menu';


export class MenuT extends Menu {
  public key: string;
}
export class Ingredient {
  public menuKey: string[] = []
  public ingredientKey: string;
  public menuName: string[] = []
  public ingredientName: string;
  public available: boolean;
}
export class FoodType {
  public ingredientName: string;
  public available: boolean;
  public price: number;
}

@Component({
  selector: 'app-food-ingredients',
  templateUrl: './food-ingredients.component.html',
  styleUrls: ['./food-ingredients.component.css']
})
export class FoodIngredientsComponent {

  displayedColumns: string[] = ['position', 'nameIngredients', 'available', 'note'];
  dataSource = new MatTableDataSource<Ingredient>();
  selection = new SelectionModel<Ingredient>(true, []);
  restaurantKey: string
  ingredients = new Array<Ingredient>()
  canEdit = false
  iconEdit = "edit"
  constructor(private fb: AngularFireDatabase) {
    this.restaurantKey = localStorage.getItem("restaurantKey")
    this.getData()
    /*  this.fb.list<FoodType>(`/foodType/${this.restaurantKey}`).valueChanges().subscribe(s => {
       this.getData()
     }) */
  }
  getData() {
    this.ingredients = []
    const menuListener = this.fb.list<MenuT>(`/menu/${this.restaurantKey}`)
      .snapshotChanges()
      .subscribe(
        menu1 => {
          menu1.forEach(m => {
            const foodTypeListener = this.fb.list<FoodType>(`/foodType/${this.restaurantKey}/${m.key}`).snapshotChanges()
              .subscribe(foodT => {

                foodT.forEach(ft => {
                  if (this.checkIngredient(ft.payload.val().ingredientName) != -1) {
                    this.ingredients[this.checkIngredient(ft.payload.val().ingredientName)].menuKey.push(m.key)
                    this.ingredients[this.checkIngredient(ft.payload.val().ingredientName)].menuName.push(m.payload.val().foodName)
                  } else {
                    const tempFoodType = new Ingredient()
                    tempFoodType.available = ft.payload.val().available
                    tempFoodType.ingredientName = ft.payload.val().ingredientName
                    tempFoodType.menuName.push(m.payload.val().foodName)
                    tempFoodType.ingredientKey = ft.key
                    tempFoodType.menuKey.push(m.key)
                    this.ingredients.push(tempFoodType)
                  }

                })
                this.dataSource.data = this.ingredients
                this.dataSource.data.forEach(e => {
                  if (!e.available) {
                    this.selection.select(e)
                  }
                })
                foodTypeListener.unsubscribe()
                menuListener.unsubscribe()
              })

          })
        })
  }
  checkIngredient(foodType: string): number {
    for (var _i = 0; _i < this.ingredients.length; _i++) {
      if (foodType === this.ingredients[_i].ingredientName) {
        return _i
      }
    }
    return -1
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
  onClickEdit() {
    this.canEdit = !this.canEdit
    if (this.canEdit) {
      this.iconEdit = "save"
      this.displayedColumns = ['select', 'position', 'nameIngredients', 'available', 'note'];


    } else {
      this.displayedColumns = ['position', 'nameIngredients', 'available', 'note'];
      this.iconEdit = "edit"
      var temp = this.dataSource.data
      var tempSelect = this.selection
      
      temp.forEach(d => {
        if (tempSelect.isSelected(d)) {
          d.menuKey.forEach(m => {
            this.fb.list(`/foodType/${this.restaurantKey}/${m}`).update(d.ingredientKey, { available: false })
            console.log(d);
            console.log(`/foodType/${this.restaurantKey}/${m}`);



          })
        } else {
          d.menuKey.forEach(m => {
            this.fb.list(`/foodType/${this.restaurantKey}/${m}`).update(d.ingredientKey, { available: true })
            console.log(d);
            console.log(`/foodType/${this.restaurantKey}/${m}`);
          })
        }
      })
      this.getData()
      console.log(this.selection.selected);
    }

  }
}
