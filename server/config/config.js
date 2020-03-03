// =================
// Puerto
// =================


process.env.PORT = process.env.PORT || 3000;


// =================
// Entorno
// =================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//  esta es una variable q existe en HEROKU

// =================
// bbdd
// =================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/myData';
} else {
    urlDB = 'mongodb+srv://<user>:<password>@primercrub-tmpxd.mongodb.net/delsaltres';
}

process.env.URLDB = urlDB;


