import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { Upload } from "src/app/shared/services/upload";
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from "@angular/material";
import { UploadService } from "src/app/shared/services/upload.service";
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from "@angular/fire/database";
import { Menu } from "src/app/shared/services/Menu";

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
    templateUrl: 'dialog-add-menu.html',
    styleUrls: ['./list-food.component.css']
})
export class DialogAddMenu {

    currentUpload: Upload
    selectedFiles: FileList
    isLinear = true;
    isUploading: boolean = false
    menu = new Menu()
    type: string[] = []
    sizeMenu: string[] = ['ธรรมดา', 'พิเศษ']
    sizeMenus: Size[] = new Array<Size>()
    sizeMenusIsNotEmpty: boolean = false
    formMenu: FormGroup
    ingredient: Ingredient[] = new Array<Ingredient>()
    haveIngredient = false
    formIngredient: FormGroup
    formSizeMenu: FormGroup
   
    picture = "https://firebasestorage.googleapis.com/v0/b/restaurant-system-9c921.appspot.com/o/System%2Fimg-01.png?alt=media&token=cd764451-42e9-45c4-9ef7-15cd2bd6142c"
    constructor(
        private fb: FormBuilder,
        private uploadImg: UploadService,
        private snackBar: MatSnackBar,
        private db: AngularFireDatabase,
        public dialogRef: MatDialogRef<DialogAddMenu>,
        @Inject(MAT_DIALOG_DATA) public resKey: string) {
        this.resKey = localStorage.getItem("restaurantKey")

        db.list<Menu>(`menu/${this.resKey}`).valueChanges().subscribe(menu => {
            this.type = []
            menu.forEach(m=>{
                if(this.checkIngredient(m.type)){
                    this.type.push(m.type)
                }
            })
            console.log(this.type);
            
        })



        this.ingredient.push()
        console.log(resKey);
        const s = new Size()
        s.size = "ธรรมดา"
        s.price = 0
        this.sizeMenus.push(s)
        this.formMenu = fb.group({
            menuName: [null, Validators.required],
            price: [0.0, Validators.required],
            type: [null, Validators.required],
            picture: [null, Validators.required]
        })
        this.formIngredient = fb.group({
            ingredientName: [null],
            ingredientPrice: [null]
        })
        this.formSizeMenu = fb.group({
            size: [null, Validators.required],
            price: [null, Validators.required]
        })

        this.formIngredient.disable()

    }
    checkIngredient(i : string){
        for(var _i =0 ;_i<this.type.length ;_i++){
            if(this.type[_i]==i){
                return false
            }
        }
        return true
    }
    addIngredient() {
        if (this.formIngredient.value.ingredientName != null && this.formIngredient.value.ingredientPrice != null) {
            var i: Ingredient = new Ingredient()
            i.ingredientName = this.formIngredient.value.ingredientName
            i.price = this.formIngredient.value.ingredientPrice
            this.ingredient.push(i)
            this.formIngredient.reset()
        }
    }
    removeIngredient(i: Ingredient) {
        const index = this.ingredient.indexOf(i, 0);
        if (index > -1) {
            this.ingredient.splice(index, 1);
        }
        this.snackBar.open(`ลบ ${i.ingredientName} เรียบร้อยแล้ว`, "ตกลง", {
            duration: 3000
        });
    }
    addSizeMenu() {
        try {
            if (this.formSizeMenu.valid) {
                var s = new Size()
                s.size = this.formSizeMenu.value.size
                s.price = this.formSizeMenu.value.price
                this.sizeMenus.push(s)
                this.formSizeMenu.reset()
                this.sizeMenusIsNotEmpty = this.sizeMenus.length != 0
            }
        } catch{ }

    }
    addMenu() {

        this.isUploading = true
        this.snackBar.open('กำลังเพิ่มเมนู', "", {
            duration: 3000
        });

        this.setDate()
        console.log(this.menu)
        this.uploadData()
    }
    setDate() {
        this.menu.foodName = this.formMenu.value.menuName
        this.menu.type = this.formMenu.value.type
        this.menu.price = this.formMenu.value.price


    }
    removeSizeMenu(item: Size) {
        const index = this.sizeMenus.indexOf(item, 0);
        if (index > -1) {
            this.sizeMenus.splice(index, 1);
        }
        this.sizeMenusIsNotEmpty = this.sizeMenus.length != 0
        this.snackBar.open(`ลบขนาด ${item.size} เรียบร้อยแล้ว`, "ตกลง", {
            duration: 3000
        });
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    uploadData() {
        this.uploadImage()
    }
    uploadImage() {

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
                this.snackBar.open('เพิ่มเมนูไม่สำเร็จ', "ตกลง", {
                    duration: 3000
                });
                this.isUploading = false
            },
            () => {
                // upload success

                uploadTask.snapshot.ref.getDownloadURL().then(url => {
                    console.log(`${url}`)
                    this.menu.picture = url
                    this.db.list<Menu>(`menu/${this.resKey}`).push(this.menu)
                        .then(m => {
                            console.log(m.key);
                            this.db.object<Ingredient[]>(`foodType/${this.resKey}/${m.key}`).set(this.ingredient)
                                .then(_ => {
                                    this.db.object<Size[]>(`foodSize/${this.resKey}/${m.key}`).set(this.sizeMenus)
                                        .then(_ => {
                                            this.isUploading = false
                                            this.snackBar.open('เพิ่มเมนูเสร็จสิ้น', "ตกลง", {
                                                duration: 3000
                                            });
                                            this.dialogRef.close();
                                        })
                                })
                        })
                })
            }
        );
    }
    detectFiles(event) {
        try {

            var reader = new FileReader();
            reader.onload = (event: any) => {
                this.picture = event.target.result
                this.formMenu.controls['picture'].setValue(event.target.result)

            }
            reader.readAsDataURL(event.target.files[0]);
            this.selectedFiles = event.target.files;
        } catch{

        }

    }

}