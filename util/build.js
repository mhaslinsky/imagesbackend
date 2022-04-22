const fs = require("fs-extra");
const childProcess = require("child_process");

try {
  fs.removeSync("/dist");
  console.log("deleting dist folder");
  childProcess.exec("tsc --build tsconfig.json");
  fs.copySync(`./nginx`, `./current`);
} catch (err) {
  console.log(err);
}
