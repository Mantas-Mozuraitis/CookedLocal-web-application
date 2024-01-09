import pg from "pg";

// Initialise posgreSQL databse connection 
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "cooked_local",
    password: "password",
    port: "5432",
})

// export as default
export default db;
