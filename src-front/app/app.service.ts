import { Store, AbstractStoreService, AbstractStoreState } from '../shuttle-store';

export const STORE_MAIN = 'main';
export const STORE_SECOND = 'second';
export const STORE_FORM = 'form';

////////////////////////////////////////////////////////////////////////////
// Parent App Service which extends StoreService
// Mainly, keys of stored values are defined here. 
export abstract class AppService extends AbstractStoreService {
  static _TITLE_ = ['app-title'];
  static _COLOR_ = ['color'];

  static _KEYINPUT_ = ['keyinput'];
  static _UNIQUEID_ = ['uniqueid'];

  static _FORMDATA_ = ['formdata'];

  static _WIKIPEDIA_ = ['wikipedia-api'];

  constructor(store: Store) { super(store); }
}

export abstract class AppState extends AbstractStoreState {
  constructor(store: Store) { super(store); }
}