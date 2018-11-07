export class User {
    public birthday: number;
    public firstName: string;
    public lastName: string;
    public personID: string;
    public phoneNumber: string;
    public picture: string;
    public department : string;
    public address: Address = new Address()
  }
  export class Address {
    public address: string;
    public district: string;
    public postalCode: string;
    public province: string;
    public subDistrict: string;
  }