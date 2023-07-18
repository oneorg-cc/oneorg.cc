const httpServer = require("http-server");
const watch = require("watch");

// 

const dev_config = require("./dev.config");

// 

httpServer.createServer({
    autoIndex: true,
    root: dev_config.server.root,
    cache: -1,
    logFn: (req, res) => {
        res.statusCode
        dev_config.server.logFn(req, res);
    }
}).listen(dev_config.server.port, dev_config.server.onlistening);

// 

let in_execution = false;

watch.createMonitor(dev_config.watcher.root, {
    interval: dev_config.watcher.interval
}, (monitor) => {
    monitor.on("changed",  async (filename, filestats, oldfilestats) => {
        if(in_execution) return;

        in_execution = true;
        await dev_config.watcher.callback();
        in_execution = false;
    });
});