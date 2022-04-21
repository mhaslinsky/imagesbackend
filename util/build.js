const fs = require("fs-extra");
const childProcess = require("child_process");

try {
  fs.removeSync("/dist");
  childProcess.exec("tsc --build tsconfig.json");
  fs.copy(`./nginx`, `./dist`);
} catch (err) {
  console.log(err);
}
