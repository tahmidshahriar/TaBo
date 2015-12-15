import java.io.IOException;

import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.io.*;

class InitMapper extends 
Mapper<LongWritable, Text, Text, Text> {
	
	/*
	 * Input: 
changbo	tahmids~Penn~cycling;singing
tahmids	changbo~Penn~drinking;partying

Output from changbo: (emit 4 outputs) (u for user, a for affiliation, i for interest) (lowercase everything)
u#changbo	u#tahmids~i#cycling~i#singing~a#penn
i#cycling	u#changbo
i#singing	u#changbo
a#penn		u#changbo
	 */
	
	public void map(LongWritable key, Text value, Context context)
			throws IOException, InterruptedException {
		
		String vString = value.toString();
		String[] vFrags = vString.split("\t");
		
		String username = "u#" + vFrags[0];
		String vertices = vFrags[1].split("~");
		
		String[] friends = vertices[0].split(";");
		String affiliation = vertices[1];
		String[] interests = vertices[2].split(";");
		
		String outString = "";
		
		for (int i = 0; i< friends.length) {
			friends[i] = "u#" + friends[i];
			outString = outString + friends[i] + "~";
		}
		
		for (int j = 0; j< interests.length) {
			interests[j] = "i#" + interests[j];
			// emit an entry for each interest vertex
			context.write(new Text(interests[j]), new Text(username));
			outString = outString + interests[i] + "~";
		}
		
		affiliation = "a#" + affiliation;
		outString = outString + affiliation;
		
		// emit an entry for the affiliation vertex
		context.write(new Text(affiliation), new Text(username));
		
		// emit an entry for the source vertex
		context.write(new Text(username), new Text(outString));
	}
	
}