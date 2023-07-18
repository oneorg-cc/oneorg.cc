const path = require("path");
const childprocess = require("child_process");

function getDatePrefix() {
    return "\x1b[1m[\x1b[0m\x1b[38;2;128;128;128m" + new Date().toUTCString() + "\x1b[0m\x1b[1m]\x1b[0m";
}

// 

const config = {
    server: {
        root: path.join(__dirname, "/docs/"),
        
        port: 16985,

        onlistening: () => {
            console.log(getDatePrefix(), "\x1b[1mDev server listening at \x1b[0m\x1b[38;2;128;128;255mhttp://localhost:" + config.server.port + "/\x1b[0m\x1b[1m\x1b[0m");
        },
        
        logFn: (req, res) => {
            // console.log(getDatePrefix(), `${req.method} \x1b[38;2;255;255;0m${req.url}\x1b[0m \x1b[38;2;128;225;255m${res.statusCode}\x1b[0m [User-Agent="${req.headers["user-agent"]}"]`);
        }
    },

    // 

    watcher: {
        root: path.join(__dirname, "/docs/"),
        
        interval: 100,
        
        callback: (filename) => {
            return new Promise((resolve, reject) => {
                const build_command = "npm run build";

                console.log(getDatePrefix(), "\x1b[1mChanges detected, building project (\x1b[0m\x1b[38;2;255;0;255m" + build_command + "\x1b[0m\x1b[1m) :\x1b[0m");
            
                const build_process = childprocess.exec(build_command);

                build_process.stdout.pipe(process.stdout);

                build_process.on("exit", (code) => {
                    if(code == 0)
                        console.log(getDatePrefix(), "\x1b[1mBuild \x1b[38;2;0;255;0msucceed\x1b[0m\x1b[1m !\x1b[0m");
                    else
                        console.log(getDatePrefix(), "\x1b[1mBuild \x1b[38;2;255;0;0mfailed\x1b[0m\x1b[1m !\x1b[0m");

                    resolve(code);
                });
            });
        }
    }
};

module.exports = config;