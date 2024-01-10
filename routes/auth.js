// Imported npm packages
import express from "express"
import passport from "passport"
import LocalStrategy from "passport-local"
import bcrypt from "bcrypt"
import flash from "express-flash";
// Custom routers
import db from "./db.js"

// Declare constant to use express router
const router = express.Router();
// Initiate flash message middleware
router.use(flash());

// Configure local strategy using database
passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.query("SELECT * FROM users WHERE username = $1", [username], function(error, row) {
        if (error) { return cb(error); }
        if (row.rowCount === 0) { return cb(null, false, { message: "Error: user with this username does not exist" });}
    
        bcrypt.compare(password, row.rows[0].password, function(error, result) {
            if (error) { return cb(error); }
            if (!result) {
                return cb(null, false, { message: "Error: incorrect password, please try again" });
            }
            return cb(null, row.rows[0]);
        });
    });
}));

// Creates a session cookie
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
});
// Destroys session cookie and gets all session data
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
});

// LOGIN ROUTES
router.get("/login", (req,res)=>{
    res.render("login.ejs");
})
router.post("/login", passport.authenticate("local", { 
    failureRedirect: "/login",
    successRedirect: "/dashboard",
    failureFlash:true
}))

// LOGOUT ROUTE
router.get("/logout", (req, res, next)=>{
    req.logout((error)=>{
      if (error) { return next(error); }
      res.redirect("/");
    });
  });

// REGISTER ROUTE
router.get("/register", (req, res)=>{
    res.render("register.ejs");
});
router.post("/register", (req,res,next)=>{
    bcrypt.hash(req.body.password, 10, async function(error, hash) {
        if (err) {return next(error);}
        try {
            const user = await db.query("INSERT INTO users (username, password) VALUES ($1,$2) RETURNING *", [req.body.username,hash]);
            req.login(user.rows[0], (error) =>{
                if (err) {return next(error);}
                console.log("Message: user has been stored successfully");
                res.redirect("/");
            });
        } catch (error) {
            return next(error);
        }
    });
})

// export as default
export default router;

