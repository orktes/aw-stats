var serverprovider = require('../../repositories/server');
exports = module.exports = function () {
  return function (req, res, next) {
    console.log("Received " + req.query.operation + " from " + req.address + ":" + req.port);
    var id = req.query.serverid;
    serverprovider.getServer(id, function (err, server) {
      if (err) {
        next(err);
        return;
      }

      if (server == null || server.id == undefined) {
        res.send({
          fail: 'Server full or not existing',
          operation: 'serveraddress'
        });
        
        return;
      }

      res.send({
        server: server.address + ":" + server.port + ":" + server.tcpPort,
        server2: server.localEndPoint,
        operation: 'serveraddress'
      });

    });
  };
};