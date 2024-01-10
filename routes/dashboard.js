// Imported npm packages
import express from "express";
// Custom routers
import db from "./db.js";

// Declare constant to use express router
const router = express.Router();

// USERS DASHBOARD ROUTE
router.get("/dashboard", (req,res)=>{
    req.isAuthenticated()
    ?res.render("dashboard.ejs", {username: req.user.username})
    :res.redirect("/");
})
// export as default
export default router;

