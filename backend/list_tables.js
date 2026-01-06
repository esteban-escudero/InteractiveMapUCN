const pool = require("./config/database");
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    .then(res => {
        console.log("Tablas encontradas:", res.rows.map(r => r.table_name));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
