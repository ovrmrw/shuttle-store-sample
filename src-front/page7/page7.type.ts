import { Control, Validators } from '@angular/common';


///////////////////////////////////////////////////////////////////////////////////
// FormData Class
export class FormData implements FormControlable {
  firstName: string;
  lastName: string;
  age: number;
  address: AddressData = new AddressData();
  tel: string;
  fax: string;
  gender: string;
  emails: string[] = [''];
}
class AddressData {
  zipCode: string;
  street: string;
}


///////////////////////////////////////////////////////////////////////////////////
// FormControl Class
export class FormControl implements FormControlable {
  firstName = new Control('', Validators.required);
  lastName = new Control('', Validators.required);
  age = new Control('', Validators.compose([Validators.required, Validators.pattern('[0-9]+')]));
  gender = new Control('', Validators.required);
  tel = new Control('', Validators.compose([Validators.required, Validators.pattern('[0-9\-]+')]));
  fax = new Control('', Validators.compose([Validators.required, Validators.pattern('[0-9\-]+')]));
  emails = [new Control('', Validators.minLength(5))]; // ここはControlの配列でなければならない。ControlArrayはNG。
  address = new AddressControl();
}
class AddressControl {
  zipCode = new Control('', Validators.required);
  street = new Control('', Validators.required);
}


///////////////////////////////////////////////////////////////////////////////////
// Interfaces
interface FormControlable {
  firstName: string | Control;
  lastName: string | Control;
  age: number | Control;
  address: {
    zipCode: string | Control;
    street: string | Control;
  };
  tel: string | Control;
  fax: string | Control;
  gender: string | Control;
  emails: string[] | Control[];
}