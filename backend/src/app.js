const express = require("express");
const cors = require("cors");
const dbClient = require("./utils/db");

// routers
const authRouter = require("./routers/AuthRouter");
const userRouter = require("./routers/UserRouter");
const clientRouter = require("./routers/ClientRouter");
const productRouter = require("./routers/ProductRouter");
const permissionRouter = require("./routers/PermissionRouter");
const orderRouter = require("./routers/OrderRouter");
const commentRouter = require("./routers/CommentRouter");

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
  app.use("/users", userRouter);
  app.use("/permissions", permissionRouter);
  app.use("/clients", clientRouter);
  app.use("/products", productRouter);
  app.use("/orders", orderRouter);
  app.use("/comments", commentRouter);

  app.get("/", (req, res) => {
    res.send("Server is running");
  });

  return app;
}

module.exports = createServer;
