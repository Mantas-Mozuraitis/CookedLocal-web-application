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
        if (row.rowCount === 0) { return cb(null, false, { message: "Username does not exist" });}
    
        bcrypt.compare(password, row.rows[0].password, function(error, result) {
            if (error) { return cb(error); }
            if (!result) {
                return cb(null, false, { message: "Incorrect password, please try again" });
            }
            return cb(null, row.rows[0]);
        });
    });
}));

// Creates a session cookie
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username, account_type: user.account_type, email: user.email });
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
    res.render("register.ejs", {
        message: req.query.message?req.query.message:""
    });
});
router.post("/register", async(req,res,next)=>{
    if (req.body.password === req.body.re_password) {
        try {
            const existingUser = await db.query("SELECT * FROM users WHERE username = $1", [req.body.username]);
            if (existingUser.rowCount === 0) {
                bcrypt.hash(req.body.password, 10, async function(error, hash) {
                    if (error) {return next(error);}
                    try {
                        const user = await db.query("INSERT INTO users (username, password, account_type, email) VALUES ($1,$2,$3,$4) RETURNING *", [req.body.username,hash,req.body.account_type, req.body.email]);
                        await db.query("INSERT INTO locations (user_id, country, city) VALUES ($1, $2, $3)", [user.rows[0].id, null, null]);
                        req.login(user.rows[0], (error) =>{
                            if (error) {return next(error);}
                            console.log("Message: user has been stored successfully");
                            res.redirect("/");
                        });
                    } catch (error) {
                        return next(error);
                    }
                });
            }else{
                res.redirect("/register?message=Username already exists");
            }
        } catch (error) {
            return next(error);
        }
    }else{
        res.redirect("/register?message=Passwords do not match");
    }
})

// CHANGE PASSWORD ROUTE
router.post("/change-password", async(req,res)=>{
    try {
        const password = (await db.query("SELECT * FROM users WHERE username = $1", [req.user.username])).rows[0].password;
        bcrypt.compare(req.body.current_password,password, (error, result)=>{
            if(error){return error;}
            if(!result){res.redirect("/dashboard?message=Current password is incorrect")}
            else{
                if (req.body.new_password === req.body.renew_password) {
                    bcrypt.hash(req.body.new_password, 10, async(error, hash)=>{
                        if(error){return error;}
                        try {
                            await db.query("UPDATE users SET password = $1 WHERE username = $2", [hash, req.user.username]);
                            res.redirect("/logout");
                        } catch (error) {
                            console.error("Error: ", error.message);s
                        }
                    });
                }else{
                    res.redirect("/dashboard?message=Passwords do not match")
                }
            }
        });
    } catch (error) {
        console.error("Error: ", error.message);
    }
})

// export as default
export default router;

