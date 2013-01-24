var 
    _ = require("underscore"),
    path = require("path"),
    child_process = require("child_process"),
    new_line = "\n",
    getProjectName = function(url, base){
        url = url || "";
        base = base || "";
        var tmp = [];
        tmp = url.split(base);
        return _.isUndefined(tmp[0]) ? "" : tmp[1];
    },
    verboseMsg = function(type, msg, res){
        switch(type){
            case "error":
                msg = "<div class='error'>" + msg + "</div>";
                break;
            default:
                msg = "<li>" + msg + "</li>";
                break;
        }
        try{
             res.write(msg, "utf-8");

        }catch(e){
            console.log(e);
        }
    },
    verboseExec = function(cmd, params, req, res, cb){
        var progress = child_process.spawn(cmd, params);
        verboseMsg("error", "start progress " + cmd + " " +  params.join(" "), res);
        progress.stdout.on("data",function(data){
            data = data.toString();
            data = data.split(new_line);

            data.forEach(function(ret){
                ret && verboseMsg("", ret, res);
            });
            
        });
        progress.stderr.on("data", function(data){
            data && verboseMsg("error", data, res);

        });
        progress.on("exit", function(code){
            var msg = code == 1 ? "command failed!<a href='/create'>返回</a>" : "command success!"
            verboseMsg("error", msg, res);
            (code == 0) && cb && cb();
        }); 
    
    };
 



_.extend(module.exports, {
    getProjectName: function(url, base){
        return getProjectName(url, base);
    },
    verboseExec: function(cmd, params, req, res, cb ){
        verboseExec(cmd, params, req, res, cb);
    },
    verboseMsg: function(type, msg, res){
        verboseMsg(type, msg, res);
    }
});



    


