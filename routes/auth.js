import express from "express"

// Declear constant to use express router
const router = express.Router();

// GET LOGIN ROUTE
router.get("/login", (req,res)=>{
    res.render("login.ejs");
})

// export as default
export default router;

