// Imported npm packages
import express from "express"
import passport from "passport"
import LocalStrategy from "passport-local"
import bcrypt from "bcrypt"
// Custom routers
import db from "./db.js"

// Declare constant to use express router
const router = express.Router();

// Configure local strategy using database
passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.query("SELECT * FROM users WHERE username = $1", [username], function(err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }
    
        bcrypt.compare(password, row.rows[0].password, function(err, result) {
            if (err) { return cb(err); }
            if (!result) {
                return cb(null, false, { message: 'Incorrect username or password.' });
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
router.post("/login", passport.authenticate('local', { failureRedirect: "/login" }),(req, res)=>{
    res.redirect("/dashboard");
})

// LOGOUT ROUTE
router.get("/logout", (req, res, next)=>{
    req.logout((err)=>{
      if (err) { return next(err); }
      res.redirect("/");
    });
  });

// REGISTER ROUTE
router.get("/register", (req, res)=>{
    res.render("register.ejs");
});
router.post("/register", (req,res)=>{
    bcrypt.hash(req.body.password, 10, async function(err, hash) {
        if (err) {return err;}
        const user = await db.query("INSERT INTO users (username, password) VALUES ($1,$2) RETURNING *", [req.body.username,hash]);
        console.log("Message: user has been stored successfully");
        res.redirect("/");
    });
    
})

// export as default
export default router;

