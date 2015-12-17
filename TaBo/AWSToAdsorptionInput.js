
var kvs = require('./models/keyvaluestore.js');
var db = require('./models/database.js');

var async = require('async');

var inputInfo = [];

// UserID will be between 8 and 15 (inclusive) in length, and only contain
// lowercase alphabets or 0 to 9

function getInputInfo(data2, err2) {

db.getAllUsernames(function(data, err) {
	if (err) {
		console.log("error pulling usernames to adsorption input: " + err);
	} else if (data.length > 0) {
		
		// important case
		
		// build an array to store the user adsorption input information
		var userDetails = [];
		
		callsLeft = data.length;
		l = data.length;
		
		for (var j = 0; j < data.length; j++) {
			
			var nextKey = data[j].key;
			var l = nextKey.length;
			
			// using "slice" function to make a copy (not reference)
			// of the key to avoid race condition
			db.getUserInfo(nextKey.slice(0,l), function(info, err) {
				
				
				if (!err && info !== null) {
					
					console.log("checking the entry for: " + info[0]);
					
					var uName = info[0];
					var infoLength = info[1].length;
	
					var thisInx = info[1][0].inx;
					var infoJSON = JSON.parse(info[1][0].value);
						
		/* Table format
		* 		JSON.stringify({"confirmedFriends" : ["changbo"], 
	  	"pendingFriends" : [],
	  	"mostRecentUpdate": "working on nets212",
	  	"firstName": "Tahmid",
	  	"lastName": "Shariar",
	  	"emailAddress": "tahmids@seas.upenn.edu",
	  	"affiliation": "Penn",
	  	"interestList": ["drinking", "partying"],
	  	"birthday": "2000.10.10"
		})
						 */
						
					var newEntry = JSON.stringify({ 
						"inx": thisInx,
						"name": uName,
						"confirmedFriends": infoJSON.confirmedFriends,
						"affiliation": infoJSON.affiliation,
						"interestList": infoJSON.interestList,
					});
					console.log("pushing: " + newEntry);
					userDetails.push(newEntry);
						
							
					// after all information is parsed and 
					// stored in the array
					
					callsLeft --;
					// if we have no more calls left, then we can be done
					if (callsLeft === 0) {
						
						// store the username information 
						// with the session
						inputInfo = userDetails;
						
						var fileString = "";

						for (var c = 0; c < inputInfo.length; c++) {
							
							var infoJSON = JSON.parse(inputInfo[c]);
							fileString = fileString + infoJSON.name + '\t';
							
							var friends = infoJSON.confirmedFriends;
							for(var f = 0; f < friends.length; f++) {
								fileString = fileString + friends[f] + ";";
							}
							fileString = 
								fileString + "~" + infoJSON.affiliation + "~";
							
							var interests = infoJSON.interestList;
							for(var ic = 0; ic < interests.length; ic++) {
								fileString = fileString + interests[ic] + ";";
							}
							
							fileString = fileString + '\n';
						}

						// write to file
						var fs = require('fs');
						fs.writeFile("test.txt", fileString, function(err) {
						    if(err) {
						        return console.log(err);
						    }

						    console.log("The file was saved!");
						}); 
						
						}
								
				}
			});	
		}

	} 
});

}

// start the program
setTimeout(getInputInfo,10000);
