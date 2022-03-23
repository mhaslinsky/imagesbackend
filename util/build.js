const fs = require("fs-extra");
const childProcess = require("child_process");

try {
  fs.removeSync("/dist");

  childProcess.exec("tsc --build tsconfig.json");
} catch (err) {
  console.log(err);
}
