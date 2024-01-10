// Imported npm packages
import express from "express";
// Custom routers
import db from "./db.js";

// Declare constant to use express router
const router = express.Router();

// USERS DASHBOARD ROUTE
router.get("/dashboard", (req,res)=>{
    res.render("dashboard.ejs", {username: req.user.username});
})
// export as default
export default router;

