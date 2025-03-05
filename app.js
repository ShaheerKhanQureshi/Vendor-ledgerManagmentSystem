// import express from "express";
// import mysql from "mysql2";
// import userRoutes from "./src/routes/userRoutes.js";
// import ledgerRoutes from "./src/routes/ledgerRoutes.js";
// import vendorRoutes from "./src/routes/vendorRoutes.js";

// const app = express();
// const PORT = process.env.PORT || 5000;

// // MySQL connection
// const db = mysql.createConnection({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "noble_corner_ledger"
// });

// db.connect((err) => {
//   if (err) {
//     console.error("Database connection failed:", err);
//     process.exit(1);
//   } else {
//     console.log("Database connected successfully");

//     app.use(express.json());

//     app.use("/api/users", userRoutes);
//     app.use("/api/ledgers", ledgerRoutes);
//     app.use("/api/vendors", vendorRoutes);

//     const server = app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });

//     const shutdown = () => {
//       server.close(() => {
//         console.log("Server is shutting down...");
//         db.end((err) => {
//           if (err) {
//             console.error("Error closing database connection:", err);
//           } else {
//             console.log("Database connection closed");
//           }
//           process.exit(0);
//         });
//       });
//     };

//     process.on("SIGINT", shutdown);
//     process.on("SIGTERM", shutdown);
//   }
// });
// import express from "express";
// import mysql from "mysql2";
// import cors from "cors"; // Import the CORS package
// import userRoutes from "./src/routes/userRoutes.js";
// import ledgerRoutes from "./src/routes/ledgerRoutes.js";
// import vendorRoutes from "./src/routes/vendorRoutes.js";
// import dashboardRoutes from "./src/routes/dashboardRoutes.js";
// // import ledgerReportRouter from './src/routes/ledgerReportRoutes.js';
// import ledgerReportRoute from './src/routes/reportRoutes.js';
// const app = express();
// const PORT = process.env.PORT || 5000;

// // MySQL connection
// const db = mysql.createConnection({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "noble_corner_ledger"
// });

// db.connect((err) => {
//   if (err) {
//     console.error("Database connection failed:", err);
//     process.exit(1);
//   } else {
//     console.log("Database connected successfully");

//     app.use(cors()); 
//     app.use(express.json());
//     app.use('/', ledgerReportRoute);
//     app.use("/api", dashboardRoutes);
//     app.use("/api/users", userRoutes);
//     app.use("/api/ledgers", ledgerRoutes);
//     app.use("/api/vendors", vendorRoutes);
//     // app.use('/api/ledgers', ledgerReportRouter);
//     const server = app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });

//     const shutdown = () => {
//       server.close(() => {
//         console.log("Server is shutting down...");
//         db.end((err) => {
//           if (err) {
//             console.error("Error closing database connection:", err);
//           } else {
//             console.log("Database connection closed");
//           }
//           process.exit(0);
//         });
//       });
//     };

//     process.on("SIGINT", shutdown);
//     process.on("SIGTERM", shutdown);
//   }
// });

import express from "express"
import mysql from "mysql2/promise"
import cors from "cors"
import userRoutes from "./src/routes/userRoutes.js"
import ledgerRoutes from "./src/routes/ledgerRoutes.js"
import vendorRoutes from "./src/routes/vendorRoutes.js"
import dashboardRoutes from "./src/routes/dashboardRoutes.js"
import ledgerReportRoute from "./src/routes/reportRoutes.js"

const app = express()
const PORT = process.env.PORT || 5000

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "noble_corner_ledger",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

app.use(cors())
app.use(express.json())

// Existing routes
app.use("/api", dashboardRoutes)
app.use("/api/users", userRoutes)
app.use("/api/ledgers", ledgerRoutes)
app.use("/api/vendors", vendorRoutes)
app.use("/", ledgerReportRoute)

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// Test database connection
;(async () => {
  try {
    const connection = await pool.getConnection()
    console.log("Database connected successfully")
    connection.release()
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  }
})()

const shutdown = () => {
  server.close(() => {
    console.log("Server is shutting down...")
    pool.end((err) => {
      if (err) {
        console.error("Error closing database connection:", err)
      } else {
        console.log("Database connection closed")
      }
      process.exit(0)
    })
  })
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

export { pool }

