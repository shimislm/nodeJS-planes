const indexR = require("./index");
const usersR = require("./users");
const planesR = require("./planes");

exports.routesInit = (app) => {
    app.use("/", indexR);
    app.use("/users", usersR);
    app.use("/planes", planesR);
}