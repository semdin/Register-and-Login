require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");
const saltRounds = 10;

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema= new mongoose.Schema({
    email: String,
    password: String
});

//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});


const User = new mongoose.model("User", userSchema);

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

app.get("/", (req, res)=> {
    res.render("home");
});



app.get('/favicon.ico' , function(req , res){/*code for not get cannot find module 'ico' error*/});
app.get("/:direction", (req, res)=> {
    const direction = req.params.direction;
    res.render(direction, {}, function(err, html) {
        if(err) {
            res.send('404 not found'); // File doesn't exist
        } else {
            res.end(html);
        }
    });
});

app.post("/register", (req,res)=>{

    bcrypt.hash(req.body.password, saltRounds, (err,hash)=>{
        const username = req.body.username;
        const password = hash;
    
        const newUser = new User(
            {
                email: username,
                password: password
            }
        );
        newUser.save().then(()=>{
            res.render("secrets");
        }).catch( (err) => {
            console.log(err);
        });
    });
});

app.post("/login", (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email : username}).then(function(user, err) {
        if (err) return console.error(err);
        if(user){

            bcrypt.compare(password, user.password, (err,result)=>{
                if(result){
                    res.render("secrets");
                }
            });

        }
      });
});



app.listen(3000, ()=>{
    console.log("Server started on port 3000.");
});
