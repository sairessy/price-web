const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public/'));
const port = process.env.PORT || 3000;

// NeDB
const Datastore = require('nedb');
const db = {};
db.users = new Datastore('./db/users.db');
db.products = new Datastore('./db/products.db');

db.users.loadDatabase();
db.products.loadDatabase();

module.exports = db;

// FIREBASE

// import initializeApp from 'firebase/app';
// const firebaseConfig = {
//   apiKey: "AIzaSyAvps6RnraTAWPjUwWin39uYTfiovm8rYE",
//   authDomain: "price-v-web.firebaseapp.com",
//   projectId: "price-v-web",
//   storageBucket: "price-v-web.appspot.com",
//   messagingSenderId: "757843251146",
//   appId: "1:757843251146:web:34b20c089e3f502a2e8933"
// };
// const firebaseApp = initializeApp(firebaseConfig);
// console.log(firebaseApp);

const Dao = require('./src/Dao')
const dao = new Dao();

const User = require('./src/User')
const user = new User();

// Cookie parser
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(cookieParser())

// Initialize express server
app.listen(port, () => {
  console.log('> ' + port);
});

// Serve files (routes)
app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', (req, res) => {
  if (req.cookies.user === undefined) {
    res.sendFile(__dirname + '/public/login.html');
  } else {
    res.sendFile(__dirname + '/public/profile.html');
  }
});

app.get('/register', (req, res) => {
  if (req.cookies.user === undefined) {
    res.sendFile(__dirname + '/public/register.html');
  } else {
    res.sendFile(__dirname + '/public/profile.html');
  }
});

app.get('/profile', (req, res) => {
  if (req.cookies.user === undefined) {
    res.sendFile(__dirname + '/public/login.html');
  } else {
    res.sendFile(__dirname + '/public/profile.html');
  }
});

app.get('/details/:id', (req, res) => {
  res.sendFile(__dirname + '/public/details.html');
});

app.get('/facility/:id', (req, res) => {
  res.sendFile(__dirname + '/public/facility.html');
});

app.get('/map/:id', (req, res) => {
  res.sendFile(__dirname + '/public/map.html');
});

app.get('/recovery', (req, res) => {
  res.sendFile(__dirname + '/public/recovery.html');
});

app.get('/search', (req, res) => {
  res.sendFile(__dirname + '/public/search.html');
});

// Get requests
app.get('/delete/:id', (req, res) => {
  if (req.cookies.user !== undefined) {
    const id = req.params.id;
    const deleteProduct = user.deleteProduct(id);
    res.redirect('/profile');
  } else {
    res.redirect('/profile');
  }
  res.end();
});

app.get('/edit/:id', (req, res) => {
  res.sendFile(__dirname + '/public/edit.html');
});

app.get('/productinfo/:id', async (req, res) => {
  const id = req.params.id;
  const product = await dao.getProductInfo(id);
  res.json(product);
});

app.get('/logout', (req, res) => {
  res.cookie('user', '', { maxAge: 0, httpOnly: true });
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/checkauth', (req, res) => {
  res.json({ status: req.cookies.user === undefined });
});

app.get('/products/limit/:limit', async (req, res) => {
  const products = await dao.getProducts(req.params.limit);
  res.json(products);
});

app.get('/facilityinfo', async (req, res) => {
  const profile = await dao.getFacilityInfo(req.cookies.user);
  res.json(profile);
});

app.get('/facilitypublicinfo/:id', async (req, res) => {
  const profile = await dao.getFacilityInfo(req.params.id);
  res.json(profile);
});

app.get('/facilityproducts', async (req, res) => {
  const facilityProducts = await dao.getFacilityProducts(req.cookies.user);
  res.json(facilityProducts);
});

app.get('/facilitypublicproducts/:id', async (req, res) => {
  const facilityProducts = await dao.getFacilityProducts(req.params.id);
  res.json(facilityProducts);
});

app.get('/product/:id', async (req, res) => {
  if (req.cookies.user) {
    const product = await dao.getProduct(req.params.id);
    res.json(product);
  } else {
    res.end();
  }
});

app.get('/products/category/:id', (req, res) => {
  res.sendFile(__dirname + '/public/category.html')
});

app.get('/searchproduct/:text', async (req, res) => {
  const text = req.params.text;
  const searchResult = await dao.getSearchText(text);
  res.json(searchResult);
});

app.get('/facilities', async (req, res) => {
  const fs = await dao.getFacilities();
  res.json(fs);
});

// Post requests
// User login
app.post('/auth', async (req, res) => {
  const data = req.body;
  const login = await user.login(data);

  if (login.status) {
    var cookie = req.cookies.user;
    if (cookie === undefined) {
      res.cookie('user', login.id, { maxAge: 900000, httpOnly: true });
    }
    // next(); // <-- important!
  }

  res.json(login);
});

// User register
app.post('/register', (req, res) => {
  const data = req.body;
  const register = user.register(data);
  res.json(register);
});

// User add product
app.post('/addproduct', (req, res) => {
  const product = req.body;
  const id = req.cookies.user;
  const time = new Date().getTime();
  product.time = time;
  product.user = id;
  const addProduct = user.addProduct(product);
  res.json(addProduct);
});

app.post('/updateprofile', (req, res) => {
  const data = req.body;
  const id = req.cookies.user;
  const updateProfile = user.updateProfile(data, id);
  res.json(updateProfile);
});

app.post('/editproduct', async (req, res) => {
  const edit = await user.editProduct(req.body, req.cookies.user);
  res.json(edit);
});

app.post('/productscategory', async (req, res) => {
  const id = req.body.id;
  const products = await dao.getProductsCategory(id);
  res.json(products);
});

app.post('/updateproductphoturl', async (req, res) => {
  const data = req.body;
  const updateUrl = await dao.updateProductPhotoUrl(data);
  res.json(updateUrl);
});

app.post('/updateuserlocation', async (req, res) => {
  const updateLocation = await user.updateLocation(req.body, req.cookies.user);
  res.json(updateLocation);
});

app.post('/userexists', async (req, res) => {
  const exists = await user.exists(req.body);
  res.json(exists);
});

app.post('/recoverypassword', async (req, res) => {
  const recovery = await user.recoveryPassword(req.body);
  res.json(recovery);
});

