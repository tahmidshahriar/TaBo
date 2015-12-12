package edu.upenn.nets212.hw3;
import java.io.IOException;

import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.io.*;

class InitMapper extends 
Mapper<LongWritable, Text , Text, Text> { 
	
	public void map(LongWritable key, Text value, Context context)
			throws IOException, InterruptedException {
		
		String vString = value.toString();
		String[] vFrags = vString.split("\t");
		String outK = vFrags[0];
		String outV = vFrags[1];
		
		// emit an entry for the source vertex
		context.write(new Text(outK), new Text(outV));
		
		// also emit an entry for the target vertex
		context.write(new Text(outV), new Text(" "));
	}
	
}