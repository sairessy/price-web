const db = require('../index');

class Dao {
  constructor() { }

  async getFacilityInfo(id) {
    const result = await new Promise((resolve, reject) => {
      db.users.find({ _id: id }, (err, data) => {
        resolve(data[0]);
      });
    });

    return result;
  }

  async getFacilityProducts(id) {
    const result = await new Promise((resolve, reject) => {
      db.products.find({ user: id }, (err, data) => {
        resolve(data);
      });
    });

    return result;
  }

  async getProducts(limit) {
    let result = await new Promise((resolve, reject) => {
      db.products.find({}, (err, d) => {
        resolve(d);
      });
    });

    var a = [];

    for (let i = 0; i < result.length; i++) {
      const p = result[i];
      const f = await new Promise((resolve, reject) => {
        db.users.find({ _id: p.user }, (err, d) => {
          // const { facilityName, facilityContact, facilityCategory, _id } = d[0];
          // resolve({ facilityName, facilityContact, facilityCategory, _id, facilityLocation: d[0].userLocation });
          resolve(d[0]);
        });
      })

      result[i].facilityInfo = f;
    }

    return { products: result, limitReached: false };
  }

  async getProductInfo(id) {
    const result = await new Promise((resolve, reject) => {
      db.products.find({ _id: id }, (err, d) => {
        let product = d[0];
        resolve(product);
      });
    });

    return result;
  }

  async getProduct(id) {
    const result = await new Promise((resolve, reject) => {
      db.products.find({ _id: id }, (err, data) => {
        resolve(data[0]);
      });
    });

    return result;
  }

  async getProductsCategory(id) {
    let result = await new Promise((resolve, reject) => {
      db.products.find({ productCategory: id }, (err, d) => {
        resolve(d);
      });
    });

    var a = [];

    for (let i = 0; i < result.length; i++) {
      const p = result[i];
      const f = await new Promise((resolve, reject) => {
        db.users.find({ _id: p.user }, (err, d) => {
          // const { facilityName, facilityContact, facilityCategory, _id } = d[0];
          // resolve({ facilityName, facilityContact, facilityCategory, _id, facilityLocation: d[0].userLocation });
          resolve(d[0]);
        });
      })

      result[i].facilityInfo = f;
    }

    return result;
  }

  async getSearchText(text) {
    const result = await new Promise((resolve, reject) => {
      db.products.find({}, (err, data) => {
        const products = data.filter((product) => product.title.toLowerCase().includes(text.toLowerCase()));
        resolve(products);
      });
    });

    var a = [];

    for (let i = 0; i < result.length; i++) {
      const p = result[i];
      const f = await new Promise((resolve, reject) => {
        db.users.find({ _id: p.user }, (err, d) => {
          // const { facilityName, facilityContact, facilityCategory, _id } = d[0];
          // resolve({ facilityName, facilityContact, facilityCategory, _id, facilityLocation: d[0].userLocation });
          resolve(d[0]);
        });
      })

      result[i].facilityInfo = f;
    }

    return result;
  }

  async updateProductPhotoUrl(data) {

    db.products.update({ _id: data.productId }, {
      $set: {
        photo: { url: data.url, name: data.fileName }
      }
    }, { multi: true }, function (err, numReplaced) {
    });

    return {
      status: true
    }
  }

  async getFacilities() {
    const result = await new Promise((resolve, reject) => {
      db.users.find({}, (err, data) => {
        let users = [];

        data.forEach(user => {
          if (user.facilityName !== undefined) {
            users.push({ id: user._id, name: user.facilityName, category: user.facilityCategory })
          }
        });

        resolve(users);
      })
    });

    return result;
  }
}

module.exports = Dao;