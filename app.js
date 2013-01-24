var express = require("express"),
    path = require("path"),
    partials = require("express-partials"),
    viewRoot = path.join(__dirname, "public/views"),
    routes = require("./routes.js"),
    app = express(),
    init = function(){
        app.set("view engine", "html");
        app.set("views", viewRoot);
        app.engine(".html", require("ejs").renderFile);
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(partials());
        routes(app);
        app.listen(3000);
    };

init();
