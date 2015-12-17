import java.io.IOException;

import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.io.*;

class InitMapper extends 
Mapper<LongWritable, Text, Text, Text> {
	
	/*
	 * Sample Input: 
changbo	tahmids~Penn~cycling;singing
tahmids	changbo~Penn~drinking;partying

Sample Output from changbo: (emit 4 outputs) (u for user, a for affiliation, i for interest) (lowercase everything)
u#changbo	u#tahmids~i#cycling~i#singing~a#penn
i#cycling	u#changbo
i#singing	u#changbo
a#penn		u#changbo
	 */
	
	public void map(LongWritable key, Text value, Context context)
			throws IOException, InterruptedException {
		
		// convert everything into lowercase to improve accuracy
		// e.g. interested in "Penn" is probably the same as interested in "penn"
		String vString = value.toString().toLowerCase();
		String[] vFrags = vString.split("\t");
		
		String username = "u#" + vFrags[0];
		String[] vertices = vFrags[1].split("~");
		
		String outString = "";
		
		// only emit entries for friends when friends exist (instead of being
		// represtend by an empty String)
		if (vertices[0].length() > 0) {
			String[] friends = vertices[0].split(";");
			for (int i = 0; i< friends.length;i++) {
				
				// give users a "u#" prefix
				friends[i] = "u#" + friends[i];
				outString = outString + friends[i] + "~";
			}
		}
		
		// affiliation is always present for any user;
		// Affiliation is a mandatory entry on sign-up and cannot be 
		// changed/removed afterwards
		String affiliation = vertices[1];
		
		// give affiliations a "a#" prefix
		affiliation = "a#" + affiliation;
		
		// emit an entry for the affiliation vertex
		context.write(new Text(affiliation), new Text(username));
		
		outString = outString + affiliation + "~";
		
		// only emit entries for interests when the user has listed interests
		if (vertices.length > 2) {
			String[] interests = vertices[2].split(";");
			for (int j = 0; j< interests.length;j++) {
				
				// give interests an "i#" prefix
				interests[j] = "i#" + interests[j];
				// emit an entry for each interest vertex
				context.write(new Text(interests[j]), new Text(username));
				outString = outString + interests[j] + "~";
			}
		}
		
		// emit an entry for the source vertex containing its adjacency list
		context.write(new Text(username), new Text(outString));
	}
	
}