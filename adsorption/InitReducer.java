package edu.upenn.nets212.hw3;

import java.io.IOException;
import java.util.LinkedList;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

class InitReducer extends 
Reducer<Text, Text , Text, Text> { 

	public void reduce(Text key, Iterable<Text> values,
			Context context) throws IOException, InterruptedException {
		
		LinkedList<String> targets = new LinkedList<String>();
		
		for (Text v : values) {
			String s = v.toString();
			
			// add those non-placeholder targets to the collection
			if (!s.equals(" ")) {
				targets.add(s);	
			}
		}
		
		String outputString = "1 ";
		
		// create a comma-delimited list of targets
		for (String st: targets){
			outputString = outputString + st + ",";
		}
		Text outputV = new Text(outputString);
				
		context.write(key, outputV);
	}
}
