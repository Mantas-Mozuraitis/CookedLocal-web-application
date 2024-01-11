// Imported npm packages
import express from "express";
import bcrypt from "bcrypt";
// Custom routers
import db from "./db.js";

// Declare constant to use express router
const router = express.Router();

// DASHBOARD ROUTES
router.get("/dashboard", (req,res)=>{
    req.isAuthenticated()
    ?res.render("dashboard.ejs", {
        username: req.user.username, 
        account_type: req.user.account_type, 
        email: req.user.email, 
        message: req.query.message?req.query.message:""
    })
    :res.redirect("/");
})
// export as default
export default router;

