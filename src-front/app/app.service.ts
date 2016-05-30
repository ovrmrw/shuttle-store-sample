import { Store, StoreService, NOTIFICATOR } from '../shuttle-store';

////////////////////////////////////////////////////////////////////////////
// Parent App Service which extends StoreService
// Mainly, keys of stored values are defined here. 
export abstract class AppService extends StoreService {
  static _NOTIFICATOR_ = [NOTIFICATOR];

  static _TITLE_ = ['app-title'];
  static _COLOR_ = ['color'];

  static _KEYINPUT_ = ['keyinput'];
  static _UNIQUEID_ = ['uniqueid'];

  static _FORMDATA_ = ['formdata'];

  static _WIKIPEDIA_ = ['wikipedia-api'];

  constructor(store: Store) { super(store); }
}