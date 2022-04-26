const fs = require("fs-extra");
const childProcess = require("child_process");

try {
  childProcess.exec("tsc --build tsconfig.json");
  fs.copySync(`./nginx`, `./`);
} catch (err) {
  console.log(err);
}
