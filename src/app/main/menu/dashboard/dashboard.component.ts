import { Component, OnInit } from '@angular/core';
import { NotificationsService, NotificationType } from 'angular2-notifications';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Menu } from 'src/app/shared/services/Menu';
import { AngularFireDatabase } from '@angular/fire/database';
import { Feedback } from 'src/app/shared/services/feedback';
import { Table } from 'src/app/shared/services/Table';


export class FeedbackT extends Feedback {
	public cusObj: Customer = new Customer()
}
export class Customer {
	public firstName: string = '';
	public lastName: string = '';
	public picture: string = '';
}
export class Order {
	public status: string;
}
@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	menus = new Array<Menu>()
	feedback: Array<FeedbackT> = []
	restaurantKey: string
	restaurantRating = 0
	table: Array<Table> = []
	orderWaiting: Array<Order> = []
	orderServe: Array<Order> = []
	orderPayment: Array<Order> = []



	constructor(
		private fb: AngularFireDatabase

	) {
		this.restaurantKey = localStorage.getItem("restaurantKey")
		fb.list<Menu>(`menu/${this.restaurantKey}`).valueChanges().subscribe(m => {
			this.menus = []
			m.sort((a, b) => a.orderAmount > b.orderAmount ? -1 : a.orderAmount < b.orderAmount ? 1 : 0)
			if (m.length < 8) {
				this.menus = m
			} else {
				for (var _i = 0; _i < 8; _i++) {
					this.menus.push(m[_i])
				}
			}
		})
		fb.object<number>(`restaurant/${this.restaurantKey}/rating`).valueChanges().subscribe(r => {
			this.restaurantRating = r

		})
		fb.list<FeedbackT>(`feedback/${this.restaurantKey}`).valueChanges().subscribe(f => {
			const temp = new Array<FeedbackT>()

			f.forEach(feed => {
				const customerListener = fb.object<Customer>(`customer/${feed.customer}`).valueChanges().subscribe(
					cus => {
						feed.cusObj = cus
						temp.push(feed)
						this.feedback = temp.sort((a, b) => a.date > b.date ? -1 : a.date < b.date ? 1 : 0)
						customerListener.unsubscribe()

					})
			})
		})

		fb.list<Table>(`/table/${this.restaurantKey}`).valueChanges().subscribe(t => {
			this.table = []
			t.forEach(tt => {
				if (tt.available) {
					this.table.push(tt)
				}
			})
		})
		fb.list<Order>("/order", ref => ref.orderByChild("restaurantID").equalTo(`${this.restaurantKey}`)).valueChanges().subscribe(o => {
			this.orderWaiting = []
			this.orderServe = []
			this.orderPayment = []
			o.forEach(oo => {
				if (oo.status === "รอรับออเดอร์") {
					this.orderWaiting.push(oo)
				} else if (oo.status === "รอการชำระเงิน") {
					this.orderPayment.push(oo)

				} else if (oo.status === "รอลูกค้ามารับ" || oo.status === "รอเสริฟ") {
					this.orderServe.push(oo)
				}
			})
		})
	}

	ngOnInit() {

	}
	convertDate(date: number, fromDate: boolean = true) {
		const d = new Date(date)
		const dd = d.getDay()
		const mm = d.getMonth()
		const yyyy = d.getFullYear() + 543
		const hh = d.getHours()
		const MM = d.getMinutes()
		var ddStr: string;
		var mmStr: string;
		var MMStr: string;
		var hhStr: string;

		if (dd < 10) {
			ddStr = "0" + dd;
		} else {
			ddStr = dd.toString();
		}
		if (mm < 10) {
			mmStr = "0" + mm;
		} else {
			mmStr = mm.toString();
		}
		if (hh < 10) {
			hhStr = "0" + hh
		} else {
			hhStr = hh.toString()
		}
		if (MM < 10) {
			MMStr = "0" + MM
		} else {
			MMStr = MM.toString()
		}
		if (fromDate) {
			/* return `${ddStr}/${mmStr}/${yyyy}` */
			var today = new Date()
			var datenoti = d.getDay() + d.getMonth() + d.getFullYear()
			var now = today.getDay() + today.getMonth() + today.getFullYear()
			if (datenoti === now) {
				return "วันนี้ " + `${hhStr}:${MMStr} น.`
			} else {
				return `${ddStr}/${mmStr}/${yyyy} ` + `${hhStr}:${MMStr} น.`
			}
		} else {
			return `${hhStr}:${MMStr} น.`
		}


	}
}
