module.exports = function (app) {

    var riotdataretriever = require('../controllers/controller');
    // Routes

    /*app.route('/test')
        .get(riotdataretriever.elvis);*/
    app.route('/avgGameDuration')
        .get(riotdataretriever.avgGameDuration);
    app.route('/updateMatches')
        .get(riotdataretriever.updateMatches);
    app.route('/getMatches')
        .get(riotdataretriever.getMatches);
};