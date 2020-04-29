require('./config/config');
const mongoose = require('mongoose');
const express = require('express');

const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());


// importamos routes
app.use(require('./routes/index'));








//////////////CONNECT bbdd//////////////////

mongoose.connect(process.env.URLDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, resp) => {

        if (err) throw err;
        console.log('BBDD onLine');
    }

);

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

/////////////puerto/////////////////
app.listen(process.env.PORT, () => {
    console.log(`escuchando puerto ${ process.env.PORT }`);

});