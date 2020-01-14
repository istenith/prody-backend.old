const mongoose = require('mongoose');
const config = require('./config');

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(cosfig.MONGOURI, {
      useNewUrlParser: true,
    });
    console.log('Connected to DB !!');
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;
