import { Observable } from 'rxjs/Rx';


export function setTimeoutPromise(ms: number, forNextTurn: boolean = false): Promise<any> {
  return new Promise(resolve => {
    setTimeout(() => {
      if (forNextTurn) {
        console.log('***** setTimeout for forwarding Zone\'s turn: ' + ms + ' ms *****');
      } else {
        console.log('***** setTimeout: ' + ms + ' ms *****');
      }
      resolve();
    }, ms);
  });
}


export function elementText(element: HTMLElement, selectors: string, index: number = 0): string {
  return element.querySelectorAll(selectors)[index].textContent;
}


export function elements(element: HTMLElement, selectors: string): NodeListOf<Element> {
  return element.querySelectorAll(selectors);
}


export function observableValue<T>(obs: Observable<T>): T {
  let _value: any;
  obs.subscribe(value => _value = value).unsubscribe(); // unsubscribeしないとsubscriptionが生き続けて処理の邪魔をする。
  return _value;
}