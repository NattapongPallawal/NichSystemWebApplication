import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { Upload } from "src/app/shared/services/upload";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from "@angular/material";
import { UploadService } from "src/app/shared/services/upload.service";
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from "@angular/fire/database";
import { Menu } from "src/app/shared/services/Menu";
import { EditMenu } from "./list-food.component";

export class Ingredient {

    public ingredientName: string
    public price: number
    public available: boolean = true
}
export class Size {
    public size: string
    public price: number

}
@Component({
    selector: 'add-menu',
    templateUrl: './dialog-edit-menu.html',
    styleUrls: ['./list-food.component.css']
})
export class DialogEditMenu {

    currentUpload: Upload
    selectedFiles: FileList
    isLinear = true;
    isUploading: boolean = false
    menu = new Menu()
    type: string[] = ['ต้ม', 'ผัด', 'แกง', 'ทอด'];
    sizeMenu: string[] = ['ธรรมดา', 'พิเศษ']
    sizeMenus: Size[] = new Array<Size>()
    sizeMenusKey: string[] = new Array<string>()
    sizeMenusIsNotEmpty: boolean = false
    formMenu: FormGroup
    ingredient: Ingredient[] = new Array<Ingredient>()
    ingredientKey: string[] = new Array<string>()
    haveIngredient = false
    formIngredient: FormGroup
    formSizeMenu: FormGroup
    menuAvailable = false
    picture = "https://firebasestorage.googleapis.com/v0/b/restaurant-system-9c921.appspot.com/o/System%2Fimg-01.png?alt=media&token=cd764451-42e9-45c4-9ef7-15cd2bd6142c"

    constructor(
        private fb: FormBuilder,
        private uploadImg: UploadService,
        private snackBar: MatSnackBar,
        private db: AngularFireDatabase,
        public dialogRef: MatDialogRef<DialogEditMenu>,
        @Inject(MAT_DIALOG_DATA) public menuEdit: EditMenu) {

        db.object<Menu>(`menu/${this.menuEdit.resKey}/${this.menuEdit.menuKey}`).valueChanges().subscribe(m => {
            this.menu = m
            this.menuAvailable = m.available

            console.log(this.menu);

        })
        this.db.list<Ingredient>(`foodType/${this.menuEdit.resKey}/${this.menuEdit.menuKey}`).snapshotChanges().subscribe(i => {
            this.ingredient = []
            this.ingredientKey = []
            i.forEach(ii => {
                this.ingredient.push(ii.payload.val())
                this.ingredientKey.push(ii.payload.key)
            })
        })
        this.db.list<Size>(`foodSize/${this.menuEdit.resKey}/${this.menuEdit.menuKey}`).snapshotChanges().subscribe(s => {
            this.sizeMenus = []
            this.sizeMenusKey = []
            s.forEach(ss => {
                this.sizeMenus.push(ss.payload.val())
                this.sizeMenusKey.push(ss.payload.key)
            })
        })

        this.formMenu = fb.group({
            menuName: [null, Validators.required],
            price: [0.0, Validators.required],
            type: [null, Validators.required]
        })
        this.formIngredient = fb.group({
            ingredientName: [null],
            ingredientPrice: [null]
        })
        this.formSizeMenu = fb.group({
            size: [null, Validators.required],
            price: [null, Validators.required]
        })



    }
    deleteMenu(){
        var temp = this.menuEdit.menu.foodName
        this.db.object(`menu/${this.menuEdit.resKey}/${this.menuEdit.menuKey}`).remove()
        .then(_=>{
            this.db.object(`foodType/${this.menuEdit.resKey}/${this.menuEdit.menuKey}`).remove()
            .then(_=>{
                this.db.object(`foodSize/${this.menuEdit.resKey}/${this.menuEdit.menuKey}`).remove()
                .then(_=>{
                    this.snackBar.open(`ลบเมนู ${temp} เรียบร้อยแล้ว`, "ตกลง", {
                        duration: 3000
                    });
                    this.dialogRef.close();
                })
            })
        })
    }

    changeAvailable(available: boolean) {
        this.menu.available = available
        this.db.object<Menu>(`menu/${this.menuEdit.resKey}/${this.menuEdit.menuKey}`).update(this.menu)

    }

    upDatePrice() {
        this.snackBar.open('กำลังอัพเดทราคา', "ตกลง", {
            duration: 3000
        });
        this.db.object<Menu>(`menu/${this.menuEdit.resKey}/${this.menuEdit.menuKey}`).update(this.menu)
            .then(m => {
                this.snackBar.open('อัพเดทราคาเสร็จสิ้น', "ตกลง", {
                    duration: 3000
                });

            })


    }
    addIngredient() {
        if (this.formIngredient.value.ingredientName != null && this.formIngredient.value.ingredientPrice != null) {
            var i: Ingredient = new Ingredient()
            i.ingredientName = this.formIngredient.value.ingredientName
            i.price = this.formIngredient.value.ingredientPrice
            this.ingredient.push(i)
            this.db.object<Ingredient[]>(`foodType/${this.menuEdit.resKey}/${this.menuEdit.menuKey}`).set(this.ingredient).then(_ => {
                this.snackBar.open(`เพิ่ม ${this.formIngredient.value.ingredientName} เรียบร้อยแล้ว`, "ตกลง", {
                    duration: 3000
                });
                this.formIngredient.reset()
            })

        }
    }
    removeIngredient(i: Ingredient) {

        const index = this.ingredient.indexOf(i, 0);
        console.log(index);

        if (index > -1) {
            this.ingredient.splice(index, 1);
        }
        this.db.object<Ingredient>(`foodType/${this.menuEdit.resKey}/${this.menuEdit.menuKey}/${this.ingredientKey[index]}`).remove().then(_ => {
            this.snackBar.open(`ลบ ${i.ingredientName} เรียบร้อยแล้ว`, "ตกลง", {
                duration: 3000
            });
        })

    }
    addSizeMenu() {
        try {
            if (this.formSizeMenu.valid) {
                var s = new Size()
                s.size = this.formSizeMenu.value.size
                s.price = this.formSizeMenu.value.price
                this.sizeMenus.push(s)
                this.db.object<Size[]>(`foodSize/${this.menuEdit.resKey}/${this.menuEdit.menuKey}`).set(this.sizeMenus).then(_ => {
                    this.snackBar.open(`เพิ่มขนาด ${this.formSizeMenu.value.size} เรียบร้อยแล้ว`, "ตกลง", {
                        duration: 3000
                    });
                    this.formSizeMenu.reset()
                })


            }
        } catch{ }

    }
    removeSizeMenu(item: Size) {
        const index = this.sizeMenus.indexOf(item, 0);
        if (index > -1) {
            this.sizeMenus.splice(index, 1);
        }
        this.db.object<Ingredient>(`foodSize/${this.menuEdit.resKey}/${this.menuEdit.menuKey}/${this.sizeMenusKey[index]}`).remove().then(_ => {
            this.snackBar.open(`ลบขนาด ${item.size} เรียบร้อยแล้ว`, "ตกลง", {
                duration: 3000
            });
        })

    }
    setDate() {
        this.menu.foodName = this.formMenu.value.menuName
        this.menu.type = this.formMenu.value.type
        this.menu.price = this.formMenu.value.price


    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    uploadImage() {
        this.isUploading = true
        let file = this.selectedFiles.item(0)
        this.currentUpload = new Upload(file);
        this.currentUpload.name = file.name //"res-test1." + file.name.split('.')[1]
        console.log(this.currentUpload.name)
        let uploadTask = this.uploadImg.uploadImage(this.currentUpload, "Restaurant/Menu", "rtdbPath")
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
                console.log((uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100);

            },
            (error) => {
                // upload failed
                console.log(error)
                this.snackBar.open('อัพเดทเมนูไม่สำเร็จ', "ตกลง", {
                    duration: 3000
                });
                this.isUploading = false
            },
            () => {
                // upload success

                uploadTask.snapshot.ref.getDownloadURL().then(url => {
                    this.db.list(`menu/${this.menuEdit.resKey}`).update(this.menuEdit.menuKey.toString(), { picture: url })
                        .then(m => {
                            this.snackBar.open('อัพเดทเมนูเสร็จสิ้น', "ตกลง", {
                                duration: 3000
                            });
                            this.isUploading = false
                            /* console.log(m.key);
                            this.db.list<Ingredient[]>(`foodType/${this.menuEdit.resKey}/${m.key}`).push(this.ingredient)
                                .then(_ => {
                                    this.db.object<Size[]>(`foodSize/${this.menuEdit.resKey}/${m.key}`).set(this.sizeMenus)
                                        .then(_ => {
                                            this.isUploading = false
                                            this.snackBar.open('เพิ่มเมนูเสร็จสิ้น', "ตกลง", {
                                                duration: 3000
                                            });
                                            this.dialogRef.close();
                                        })
                                }) */
                        })
                })
            }
        );
    }
    detectFiles(event) {
        try {
            var reader = new FileReader();
            reader.onload = (event: any) => {
                // this.menuEdit.menu.picture = event.target.result
                // this.formRastaurantPicture.controls['picture'].setValue(event.target.result)
            }
            reader.readAsDataURL(event.target.files[0]);
            this.selectedFiles = event.target.files;
            this.uploadImage()
        } catch{
        }

    }

}