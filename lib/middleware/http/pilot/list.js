var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var limit = req.params.limit || req.query.limit;
    var page = req.params.page || req.query.page;
    var sort = req.params.sortBy || req.query.sortBy || 'username';
    if (limit === undefined) {
      return next(new Error("Specify limit"));
    }
    if (page === undefined) {
      return next(new Error("Specify page"));
    }
    pilotRepository.getPilots(page, limit, sort, function (err, data) {
      if (err) {
        return next(err);
      }

      req.pilots = data;
      if (respond) {
        pilotRepository.getPilotsCount(function (err, count) {
          if (err) {
            return next(err);
          }
          res.send({pilots: pilotRepository.filterPilotData(data),  page: Number(page), limit: Number(limit), total: Number(count)});
        });
      } else {
        next();
      }
    });
  };
};