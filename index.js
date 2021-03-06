const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const socket = require('./socket');
const cors = require('cors')
const app = express();


app.use(cors());

app.engine('hbs',exphbs({
    extname: '.hbs'
}));

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}))

app.use(express.static('public'))

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname,'views'))

socket.connect(app);
// app.listen(process.env.PORT || 3000);
app.get('/',(req,res)=>{
    res.render('login');
})

app.post('/caroRoom',(req,res)=>{
    let user = req.body.user;
    let room = req.body.room;
    res.render('caroRoom',{user,room})
})