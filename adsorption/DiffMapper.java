package edu.upenn.nets212.hw3;

import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

class DiffMapper extends 
Mapper<LongWritable, Text , Text, Text> { 
	
	public void map(LongWritable key, Text value, Context context)
			throws IOException, InterruptedException {
		
		String vString = value.toString();
		String[] vKV = vString.split("\t");
		String[] vFrags = vKV[1].split(" ");
		String k = vKV[0];
		
	    String Rank = vFrags[0];
		
	    // output the ID as key and rank as value
		context.write(new Text(k), new Text(Rank));
	}
}
