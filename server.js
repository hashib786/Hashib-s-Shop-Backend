const app = require("./app");
const connectDatabase = require("./db/database");

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error 🔥🔥🔥 : ${err.message}`);
  console.log(`Shutting Down Server for uncaughtException 🔥🔥🔥`);
});

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./config/.env",
  });
}

connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is Running on http://localhost:${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error 🔥🔥🔥 : ${err.message}`);
  console.log(`Shutting Down Server for uncaughtException 🔥🔥🔥`);

  server.close(() => {
    process.exit(1);
  });
});
