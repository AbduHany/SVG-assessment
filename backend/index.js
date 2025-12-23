const createServer = require("./src/app");
createServer().then((server) => {
  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
