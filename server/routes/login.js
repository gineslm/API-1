const express = require('express');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const app = express();



app.get('/prue', (req, res) => {

    return res.status(400).json({
        ok: true,
        men: 'funciona'

    });
});


app.post('/login', (req, res) => {


    let body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: 'Usuario desconocido'
            });
        }

        if (bcrypt.compareSync(body.password, userDB.password)) {

            let token = jwt.sign({
                myUser: userDB
            }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

            return res.status(400).json({
                ok: true,
                user: userDB,
                token
            });

        } else {
            return res.status(400).json({
                ok: false,
                err: 'Contraseña incorrecta'
            });
        }
    });




});


module.exports = app;