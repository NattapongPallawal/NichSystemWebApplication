import { Address } from "./Address";

export class Employee {
    public firstName: string;
    public lastName: string;
    public department: string;
    public workAt: string;
    public active: boolean;
    public birthday: number;
    public personID: string;
    public phoneNumber: string;
    public picture: string;
    public address : Address = new Address()
}
