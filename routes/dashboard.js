// Imported npm packages
import express from "express";
// Custom routers
import db from "./db.js";

// Declare constant to use express router
const router = express.Router();

// DASHBOARD ROUTES
router.get("/dashboard", async(req,res)=>{
    if (req.isAuthenticated()) {
        const location = await db.query("SELECT * FROM locations WHERE user_id = $1", [req.user.id]);
        res.render("dashboard.ejs", {
            username: req.user.username, 
            account_type: req.user.account_type, 
            email: req.user.email, 
            country: location.rows[0].country,
            city: location.rows[0].city,
            message: req.query.message?req.query.message:""
        })
    }else{
        res.redirect("/");
    }
})

router.post("/set-location", async (req,res)=>{
    try {
        const locations = await db.query("UPDATE locations SET country = $1, city = $2 WHERE user_id = $3 RETURNING country, city;", [req.body.country, req.body.city, req.user.id]);
        res.redirect("/");
    } catch (error) {
        console.error("Error: ", error.message);
    }
})
// export as default
export default router;

