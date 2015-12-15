import java.io.IOException;
import java.util.LinkedList;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

class InitReducer extends 
Reducer<Text, Text , Text, Text> { 
	
/*
 * Input: 
u#changbo	[“u#tahmids~i#cycling~i#singing~a#penn”]
u#tahmids	[“u#changbo~i#drinking~a#penn”]
i#cycling	[“u#changbo”]
i#singing	[“u#changbo”]
i#drinking	[“u#tahmids”]
a#penn	[“u#changbo”,”u#tahmids”]

Output: 
(~ to separate the weights & the adjacency list)
(; to separate among the weights and among the adjacent nodes)
(# to separate between two parts of a weight or a vertex)
u#changbo 	1#changbo~u#tahmids;i#cycling;i#singing;a#penn
u#tahmids	1#tahmids~u#changbo;i#drinking;a#penn
i#cycling	~u#changbo
i#singing	~u#changbo
i#drinking	~u#tahmids
a#penn	~u#changbo;u#tahmids
*/

	public void reduce(Text key, Iterable<Text> values,
			Context context) throws IOException, InterruptedException {
		
		String k = key.toString();
		String[] ks = k.split("#");
		
		
		boolean isUser = ks[0].equals("u");
		
		if (!isUser) {
			for (Text v : values) {
				String s = v.toString();
				String[] frags = s.split("~");
				

			}
			
		}
		
		
		
		// create a comma-delimited list of targets
		for (String st: targets){
			outputString = outputString + st + ",";
		}
		Text outputV = new Text(outputString);
				
		context.write(key, outputV);
	}
}
