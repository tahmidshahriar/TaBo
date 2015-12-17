

// strict white listing for username so that it can only contain 
// lowercase letters and numbers (to avoid clashing of usernames etc.)
// Also, length is controlled to be at most 15 (inclusive) so that the database 
// will not be slowed down too much
// the callback function returns one value only: either error message OR null

var strict_wl = function(stringToCheck, callback) {
	
	var allowedChars = "0123456789abcdefghijklmnopqrstuvwxyz";
	var illegal = false;
	
	if (stringToCheck.length > 15 || stringToCheck.length < 1) {
		illegal = true;
	}
	else {
		    for(var index = 0; index < stringToCheck.length; index++){
		        if(allowedChars.indexOf(stringToCheck[index]) < 0){
		            illegal = true;
		            break;
		        }
		    }
	    }
	
    if (illegal) {
    	callback("Warning: Ony lowercase letters and numbers are allowed." + 
    			"Username can be 1-15 characters long.");
    }
    else {
    	callback(null);
    }
};

//general white listing for anything other than username
// only allow letters and numbers and some "harmless" punctuations
//Also, length is controlled to be at most 140 (inclusive) like Twitter 

//the callback function returns one value only: either error message OR null

var general_wl = function(stringToCheck, callback) {
	
	var allowedChars = "0123456789abcdefghijklmnopqrstuvwxyz" + 
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ!?.,";
	var illegal = false;
	
	if (stringToCheck.length > 140 || stringToCheck.length < 1) {
		illegal = true;
	}
	else {
	
		    for(var i = 0; i < stringToCheck.length; i++){
		        if(allowedChars.indexOf(stringToCheck[i]) <0){
		            illegal = true;
		            break;
		        }
		    }
	}
	
 if (illegal) {
 	callback("Warning: Special characters are not allowed!"  + 
			"Input can be 1-140 characters long.");
 }
 else {
 	callback(null);
 }
};