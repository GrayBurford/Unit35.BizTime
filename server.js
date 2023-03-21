
// Server start-up: Run this file to start the server, not app.js
const app = require("./app");

app.listen(3000, function () {
  console.log("Server started on port 3000");
});