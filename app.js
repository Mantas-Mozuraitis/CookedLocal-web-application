// Imported npm packages
import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import session from "express-session";
// Custom routers
import auth from "./routes/auth.js";
import db from "./routes/db.js";
import dasboard from "./routes/dashboard.js";

// Decleare port constant and app constant to user express server
const app = express();
const port = 3000;
// Connect the database
db.connect();

// Configure user session
app.use(session({
    secret: "ThisIsSecret.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// Declare folder of static files
app.use(express.static("public"));
// Configure body-parser middleware 
app.use(bodyParser.urlencoded({ extended: false }));

// USER AUTHENTICATION ROUTER
app.use("/", auth);
// DASHBOARD ROUTER
app.use("/", dasboard);

// ROOT 
app.get("/", (req,res)=>{
    req.isAuthenticated()?res.redirect("/dashboard"):res.render("index.ejs");
});

// LISTEN FOR REQUESTS
app.listen(port, (req, res)=>{
    console.log(`Listening on port ${port}`);
})
