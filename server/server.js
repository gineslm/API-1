require('./config/config');
const mongoose = require('mongoose');
const express = require('express');

const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

app.use(cors());


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