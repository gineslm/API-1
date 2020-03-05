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


// =================
// Vencimiento del token
// =================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


// =================
// seed para firma token
// =================
process.env.SEED_TOKEN = '39812hjkbdpq98%8418h';











/* 
mongodb+srv://naohill:HeAzU0SkCWyFY8bX@primercrub-tmpxd.mongodb.net/test
user: naohill;
password: HeAzU0SkCWyFY8bX;

heroku web page for api https://guarded-garden-55407.herokuapp.com/ 

*/