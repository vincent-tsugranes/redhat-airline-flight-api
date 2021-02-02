"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var env = require("env-var");
var pino = require("pino");
var path = require("path");
var PORT = env.get('PORT').default('8080').asPortNumber();
var LOG_LEVEL = env
    .get('LOG_LEVEL')
    .default('debug')
    .asEnum(Object.keys(pino.levels.values));
var log = pino({
    level: LOG_LEVEL,
});
var app = express();
require('kube-probe')(app);
app.use(require('helmet')());
app.use(require('morgan')('combined'));
app.get('/', function (req, res) {
    res.sendFile(path.resolve('./views/index.html'));
});
app.get('/api/hello', function (req, res) {
    var name = req.query.name || 'World';
    var message = "Hello, " + name + "!";
    log.debug("returing message \"" + message + "\"");
    res.json({
        message: message,
    });
});
app.listen(PORT, function () {
    log.info("\uD83D\uDE80 server listening on port " + PORT);
});
//# sourceMappingURL=server.js.map