const fs = require("fs-extra");
const childProcess = require("child_process");

try {
  fs.removeSync("/dist/controllers");
  fs.removeSync("/dist/middleware");
  fs.removeSync("/dist/models");
  fs.removeSync("/dist/routes");
  fs.removeSync("/dist/util");
  fs.removeSync("/dist/app.js");
  fs.removeSync("/dist/app.js.map");

  childProcess.exec("tsc --build tsconfig.json");
} catch (err) {
  console.log(err);
}
