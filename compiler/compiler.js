var fs = require("fs"),
    path = require("path"),
    child_process = require("child_process"),
    constant = require("../lib/const.js"),
    lib = require("../lib/lib.js"),
    ejs = require("ejs"),
    _ = require("underscore"),
    makeTmpPath = "./public/templates/Makefile.ejs",
    Wind = require("wind"),
    
    verboseExceAsync = Wind.Async.Binding.fromCallback(lib.verboseExec),


    compile = function(req, res, cb){
        var 
            username = req.body.username,
            password = req.body.password,
            svn_path = req.body.svn_path,
            project_name = lib.getProjectName(svn_path, constant.Path.SVN_BASE),
            tmp_path = path.join(constant.Path.TMP_BASE, project_name),
            QA_path = path.join(constant.Path.QA_BASE, project_name);
        if(!project_name){
            res.send("请输入有效的svn路径！" + svn_path);
            return;
        }

        if(!username || !password){
            res.send("用户名或密码为空！");
            return;
        }
        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });
        var command = eval(Wind.compile("async", function(){

           $await(verboseExceAsync("rm", ["-rf", tmp_path], req, res));
           $await(verboseExceAsync("mkdir", ["-p", tmp_path], req, res));

          $await(verboseExceAsync("svn", ["checkout", svn_path,tmp_path, "--username", username, "--password", password, "--no-auth-cache", "--non-interactive"], req, res));
            var configPath = path.join(tmp_path, "config.js");
            if(!fs.existsSync(configPath)){
                lib.verboseMsg("error", "项目缺少config.js 配置文件", res);
                return;
            }

            var
                makePath = path.join(tmp_path, "Makefile"),
                config = require(configPath),
                makeStr = ejs.render(fs.readFileSync(makeTmpPath, "utf-8"), {
                    scripts: config.scripts || [],
                    views: config.views || [],
                    styles: config.styles || [],
                    username: username,
                    password: password,
                    tmpPath: tmp_path,
                    QAPath: QA_path,
                    staticList: getStaticList(config)
                
                });
            
            fs.writeFileSync(makePath, makeStr, "utf-8");
            $await(verboseExceAsync("touch", ["-m",  makePath], req, res));
            $await(verboseExceAsync("make", ["-C", tmp_path, "clean"], req, res));
            $await(verboseExceAsync("make", ["-C", tmp_path], req, res));
            lib.verboseMsg("error", "编译完成，点击下面<a href='/create'>测试地址</a>进行测试！", res);
            res.end("");
            return;
        }));

        command().start();
    },
    index = function(req, res){
       res.render("create/index");
    },
    getStaticList = function(config){
        var tmpList = [
            {value: config.views, name: "view"},
            {value: config.scripts, name: "js"},
            {value: config.styles, name: "css"},
            {value: config.images, name: "images"}
        ],
        ret = [],
        i = 0,
        len = tmpList.length;
        
        for(; i < len; i++){
            if(tmpList[i].value){
                ret.push(tmpList[i].name);
            }
        }

        return ret.length ? ret.join(" ") : "";
    
    
    }

_.extend(module.exports, {
    compile: function(req, res, cb){
        compile(req, res, cb);
    
    },
    index: function(req, res){
        index(req, res);
    
    
    }
});
