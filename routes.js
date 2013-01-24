var compiler = require("./compiler/compiler.js");

module.exports = function(app){
    app.get("/create", compiler.index);
    app.post("/create", compiler.compile);

};
