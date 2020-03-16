const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose');

const usersRoutes = require('./routes/users-routes');
const placesRoutes = require('./routes/places-routes');
const HttpError = require('./models/http-error');
const app = express();

const {PORT, DB_USER, DB_PSW, DB_HOST, DB_NAME } = process.env;

app.use(bodyParser.json());

// app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// app.use((req, res, next)=>{
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
//     next();
// });

app.use(express.static('frontend/build'));

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next)=>{
    res.sendFile('frontend/build/index.html');
});

// app.use((req, res, next)=>{
//     next(new HttpError("Not Found", 404));
// })

app.use((error, req, res, next)=>{
    // if(req.file){
    //     fs.unlink(req.file.path, (err)=>{
    //         console.log(err)
    //     });
    // }
    if(res.headerSend){
        return next(error);
    }
    res.status(error.code || 500).json({message: error.message || "Something went wrong!"});
});
const URL = `mongodb+srv://${DB_USER}:${DB_PSW}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
mongoose
    .connect(URL)
    .then(()=>{
        app.listen(PORT || 5000);
    })
    .catch(console.error);