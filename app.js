// Imported npm packages
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
// Custom routers
import authRouter from './routes/auth.js';

// Decleare port constant and app constant to user express server
const app = express();
const port = 3000;

// Initialise posgreSQL databse connection 
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "cooked_local",
    password: "password",
    port: "5432",
})
db.connect();

// Declare folder of static files
app.use(express.static("public"));
// Configure body-parser middleware 
app.use(bodyParser.urlencoded({ extended: false }));

// AUTH ROUTER
app.use("/login", authRouter);


// ROOT 
app.get("/", (req,res)=>{
    res.render("index.ejs");
});

// REGISTER
app.get("/register", (req,res)=>{
    res.render("register.ejs");
})

// LISTEN FOR REQUESTS
app.listen(port, (req, res)=>{
    console.log(`Listening on port ${port}`);
})
