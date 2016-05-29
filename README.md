# shuttle-store-sample
Angular2 + Store Integration

---

A simple Store integration on Angular2 DI. This Store shares "data(states)" and "data(states)-history" between routing pages.

You can get data(states) from Store as non-Observable values, Observables or Stream Observables. 

Due to Store's Push behavior, it allows Angular2 OnPush-ChangeDetection-Strategy that makes your apps very fast.

Store now has Undo/Redo feature, it allows you to undo all of your operations. 

---

Page1 & 2 is a sample for my Store. You can see that Store keeps and returns States & States-history.

Page4 is a sample of Angular2 + C3. Your inputs cause the time graph change in real-time.

Page5 is a sample of a bit of complex form. The Component source-code is very simple (in my opinion).

Page6 is a sample for HTTP requests. A data you've got once will be cached on Store, so if you request the same data next time,
Store will return the cached data for avoiding unnecessary HTTP requests.

---

### Setup
```
npm install
```

### Run
```
npm start
```