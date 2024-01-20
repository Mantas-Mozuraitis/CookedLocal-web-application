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
        const seller_dishes = await db.query("SELECT * FROM dishes WHERE user_id = $1", [req.user.id]);
        const buyer_dishes = await db.query("SELECT dishes.* FROM dishes JOIN users ON dishes.user_id = users.id JOIN locations ON users.id = locations.user_id WHERE locations.city = $1",[location.rows[0].city]);
        const buyer_orders = await db.query("SELECT orders.id AS order_id, dishes.id, dishes.title, dishes.description, dishes.price FROM orders JOIN dishes ON orders.dish_id = dishes.id WHERE orders.buyer_id = $1;", [req.user.id]);
        const seller_orders = await db.query("SELECT orders.id AS order_id, dishes.id, dishes.title, dishes.description, dishes.price FROM orders JOIN dishes ON orders.dish_id = dishes.id WHERE dishes.user_id = $1;", [req.user.id]);
        res.render("dashboard.ejs", {
            username: req.user.username, 
            account_type: req.user.account_type, 
            email: req.user.email, 
            country: location.rows[0].country,
            city: location.rows[0].city,
            dishes: req.user.account_type === "seller"?seller_dishes.rows:buyer_dishes.rows,
            orders: req.user.account_type === "buyer"?buyer_orders.rows:seller_orders.rows,
            message: req.query.message?req.query.message:""
        })
    }else{
        res.redirect("/");
    }
})

router.post("/set-location", async (req,res)=>{
    try {
        await db.query("UPDATE locations SET country = $1, city = $2 WHERE user_id = $3", [req.body.country, req.body.city, req.user.id]);
        res.redirect("/");
    } catch (error) {
        console.error("Error: ", error.message); 
        res.redirect("/");
    }
})

router.post("/add-dish", async (req,res)=>{
    try {
        await db.query("INSERT INTO dishes (user_id, title, description, price) VALUES ($1, $2, $3, $4)", [req.user.id, req.body.dish_title, req.body.dish_description, req.body.dish_price]);
        res.redirect("/");
    } catch (error) {
        console.error("Error: ", error.message);
        res.redirect("/");
    }
})

router.post("/order-dish/:id", async (req,res)=>{
    try {
        await db.query("INSERT INTO orders (dish_id, buyer_id) VALUES ($1, $2)", [req.params.id, req.user.id]);
        res.redirect("/");
    } catch (error) {
        console.error("Error: ", error.message);
        res.redirect("/");
    }
})

router.post("/complete-order/:id", async (req,res)=>{
    try {
        await db.query("DELETE FROM orders WHERE id = $1", [req.params.id]);
        res.redirect("/");
    } catch (error) {
        console.error("Error: ", error.message);
        res.redirect("/");
    }
})
// export as default
export default router;

