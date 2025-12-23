const express = require("express");
const cors = require("cors");
const dbClient = require("./utils/db");

// routers
const authRouter = require("./routers/AuthRouter");
const roleRouter = require("./routers/RoleRouter");
const clientRouter = require("./routers/ClientRouter");
const productRouter = require("./routers/ProductRouter");
const permissionRouter = require("./routers/PermissionRouter");

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
  app.use("/permissions", permissionRouter);
  app.use("/clients", clientRouter);
  app.use("/products", productRouter);

  app.get("/", (req, res) => {
    res.send("Server is running");
  });

  return app;
}

module.exports = createServer;
