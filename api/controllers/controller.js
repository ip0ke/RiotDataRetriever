const https = require('https');
var mongoose = require('mongoose'),
    RiotApiData = mongoose.model('RiotApiData');
var sanitizer = require('sanitizer');

const apikey = "RGAPI-baffcf51-1ded-44be-829d-000fe5b9819d";
const queue = "440";
const accountId = "27998135"; //Account David
const testtimestamp = "";

const maxMatchNumber = 100;

//proof of concept #2
exports.avgGameDuration = function (req, res) {
    var matchModel = mongoose.model('RiotApiData');

    matchModel.find({}, function(err, matches) {
        if (err) return handleError(err);

        var totalDuration = new Number();
        
        for (var match in matches) {
            totalDuration += matches[match].gameDuration;
           
        }
        
        res.setHeader('Content-Type', 'application/json');

        var responseObject = {};
        
        responseObject.avgGameDuration = totalDuration / matches.length;
        res.json(responseObject)

    })
};

exports.updateMatches = function (req,res) {

    var matchModel = mongoose.model('RiotApiData');
    
    //var riotRequestMatches = "https://euw1.api.riotgames.com/lol/match/v3/matchlists/by-account/" + accountId + "?beginTime=" + beginTimeMs + "&queue=" + queue + "&api_key=" + apikey;

    // find latest match (timestamp in ms)

    var getLastTimeStampPromise = getLastTimeStamp();    
    getLastTimeStampPromise.then(function(result){

        var options = {
            host: 'euw1.api.riotgames.com',
            port: 443,
            path: '/lol/match/v3/matchlists/by-account/' + accountId + '?beginTime=' + result + '&queue=' + queue + '&api_key=' + apikey,
            method: 'GET'
        }

        var httpsRequest = https.request(options, function(res) {
            var body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function () {
                if (res.statusCode === 404) {
                    console.log("Status code: " + res.statusCode + " | Nothing to load, aborting ...");
                    return;
                }
                var matchesResponse = JSON.parse(body);
                console.log(matchesResponse);
                for (var match in matchesResponse.matches) {

                    console.log("match with matchId " + matchesResponse.matches[match].gameId + " will be requested to save in db");
                    saveMatchData(matchesResponse.matches[match].gameId);
                }

            });
        })

        httpsRequest.end();

       /* https.get("https://euw1.api.riotgames.com/lol/match/v3/matchlists/by-account/" + accountId + "?beginTime=" + result + "&queue=" + queue + "&api_key=" + apikey, (res) => {

        });*/

    }, function(err) {
        console.log(err);
    })

    //query riot API to get matches that are newer than the last timestamp
    //console.log("https://euw1.api.riotgames.com/lol/match/v3/matchlists/by-account/" + accountId + "?beginTime=" + beginTimeMs + "&queue=" + queue + "&api_key=" + apikey);

    /**/

    //TODO: get match information for those matches and save to DB

};

exports.getMatches = function (req, res) {
    
    console.log("number of matches from parameters: " + req.query.number);
    
    var numberOfMatches = sanitizer.escape(req.query.number); 
    //console.log("number of matches after getting them from parameters: " + numberOfMatches);
    if(numberOfMatches == null){
        numberOfMatches = 20;
    } else if (numberOfMatches == 0 || numberOfMatches < 0){
        numberOfMatches = 20;
    } else if (numberOfMatches > maxMatchNumber){
        numberOfMatches = maxMatchNumber;
    } 

    console.log("number of matches after checking: " + numberOfMatches);

    var getNMatchesPromise = getNMatches(numberOfMatches);
    getNMatchesPromise.then(function(result){

        res.json(result);

    }, function (err) {
        console.log(err);
    })

};

function getLastTimeStamp(){

    var beginTimeDate;
    var beginTimeMs = 0000000000000;
    var matchModel = mongoose.model('RiotApiData'); 
    
    return new Promise(function (resolve, reject) {
        matchModel.find({}).sort({ 'gameCreation': -1 }).limit(1).exec(function (err, matches) {
            
            if (err) return handleError(err);
           
            if (matches.length === 0) {
                resolve(beginTimeMs);
            } else {

                beginTimeDate = new Date(matches[0].gameCreation);
                console.log("begindate = " + beginTimeDate);
                beginTimeMs = beginTimeDate.getTime() + 1;
                resolve(beginTimeMs);
            }
        });
       
    });
}



function saveMatchData (matchId){
    
    var riotRequestMatchDetails = "https://euw1.api.riotgames.com/lol/match/v3/matches/" + matchId + "?api_key=" + apikey;

    console.log("Entered saveMatchData  with id " + matchId);

    https.get(riotRequestMatchDetails, (res) => {
        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);


        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var obj = JSON.parse(body);

            //delete not needed fields
            for (var participant in obj.participants) {
                delete obj.participants[participant].stats.neutralMinionsKilledTeamJungle;
                delete obj.participants[participant].stats.totalTimeCrowdControlDealt;
                delete obj.participants[participant].stats.longestTimeSpentLiving;
                delete obj.participants[participant].stats.perk1Var1;
                delete obj.participants[participant].stats.perk1Var3;
                delete obj.participants[participant].stats.perk1Var2;
                delete obj.participants[participant].stats.perk5;
                delete obj.participants[participant].stats.perk4;
                delete obj.participants[participant].stats.playerScore9;
                delete obj.participants[participant].stats.playerScore8;
                delete obj.participants[participant].stats.playerScore1;
                delete obj.participants[participant].stats.playerScore0;
                delete obj.participants[participant].stats.playerScore3;
                delete obj.participants[participant].stats.playerScore2;
                delete obj.participants[participant].stats.playerScore5;
                delete obj.participants[participant].stats.playerScore4;
                delete obj.participants[participant].stats.playerScore7;
                delete obj.participants[participant].stats.playerScore6;
                delete obj.participants[participant].stats.perk5Var1;
                delete obj.participants[participant].stats.perk5Var3;
                delete obj.participants[participant].stats.perk5Var2;
                delete obj.participants[participant].stats.totalScoreRank;
                delete obj.participants[participant].stats.neutralMinionsKilled;
                delete obj.participants[participant].stats.perk2Var2;
                delete obj.participants[participant].stats.perk2Var3;
                delete obj.participants[participant].stats.perk2Var1;
                delete obj.participants[participant].stats.perk4Var1;
                delete obj.participants[participant].stats.perk4Var3;
                delete obj.participants[participant].stats.largestCriticalStrike;
                delete obj.participants[participant].stats.item1;
                delete obj.participants[participant].stats.item2;
                delete obj.participants[participant].stats.item3;
                delete obj.participants[participant].stats.item4;
                delete obj.participants[participant].stats.item5;
                delete obj.participants[participant].stats.item6;
                delete obj.participants[participant].stats.item0;
                delete obj.participants[participant].stats.perk1;
                delete obj.participants[participant].stats.perk0;
                delete obj.participants[participant].stats.perk2;
                delete obj.participants[participant].stats.perk3;
                delete obj.participants[participant].stats.perk3Var3;
                delete obj.participants[participant].stats.perk3Var2;
                delete obj.participants[participant].stats.perk3Var1;
                delete obj.participants[participant].stats.perk0Var2;
                delete obj.participants[participant].stats.perk4Var2;
                delete obj.participants[participant].stats.sightWardsBoughtInGame;
                delete obj.participants[participant].stats.totalPlayerScore;
                delete obj.participants[participant].stats.objectivePlayerScore;
                delete obj.participants[participant].stats.perkPrimaryStyle;
                delete obj.participants[participant].stats.perkSubStyle;
                delete obj.participants[participant].stats.unrealKills;
                delete obj.participants[participant].stats.champLevel;
                delete obj.participants[participant].stats.perk0Var1;
                delete obj.participants[participant].stats.combatPlayerScore;
                delete obj.participants[participant].stats.perk0Var3;
                delete obj.participants[participant].timeline;
            }

            //re-map summonerName and accountId field to upper level.
            for (var participantIdentity in obj.participantIdentities) {
                obj.participantIdentities[participantIdentity].summonerName = obj.participantIdentities[participantIdentity].player.summonerName;
                obj.participantIdentities[participantIdentity].accountId = obj.participantIdentities[participantIdentity].player.accountId;
                delete obj.participantIdentities[participantIdentity].player;
            }

            // add match to db
            var new_RiotApiData = new RiotApiData(obj);
            
            new_RiotApiData.save(function (err, match) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("match with id " + matchId + " was saved successfully ");
                }
            });
        });

    }).on('error', (e) => {
        console.error(e);
    });

};

function getNMatches (numberOfMatches){

    var matchModel = mongoose.model('RiotApiData');

    return new Promise(function (resolve, reject) {
        matchModel.find({}).sort({ 'gameCreation': -1 }).limit(parseInt(numberOfMatches)).exec(function (err, matches) {

            if (err) {
                console.log(err);
                return null;
            }
            if (matches.length === 0) {
                resolve("empty");
            } else {
                resolve(matches);
            }
        });

    });

};