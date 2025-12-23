const express = require("express");
const cors = require("cors");
const dbClient = require("./utils/db");

// routers
const authRouter = require("./routers/AuthRouter");
const roleRouter = require("./routers/RoleRouter");
const clientRouter = require("./routers/ClientRouter");

async function createServer() {
  const app = express();

  //   Handle CORS
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      // credentials: true,
    })
  );
  app.use(express.json({ limit: "50mb" }));

  await dbClient.isAlive();

  app.use("/auth", authRouter);
  app.use("/roles", roleRouter);
  app.use("/clients", clientRouter);

  app.get("/", (req, res) => {
    res.send("Server is running");
  });

  return app;
}

module.exports = createServer;
