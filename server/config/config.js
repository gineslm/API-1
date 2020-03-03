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
    urlDB = 'mongodb+srv://naohill:HeAzU0SkCWyFY8bX@primercrub-tmpxd.mongodb.net/delsaltres';
}

process.env.URLDB = urlDB;


/* 
mongodb+srv://naohill:HeAzU0SkCWyFY8bX@primercrub-tmpxd.mongodb.net/test
user: naohill;
password: HeAzU0SkCWyFY8bX; 
*/