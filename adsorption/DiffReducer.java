package edu.upenn.nets212.hw3;

import java.io.IOException;
import java.util.LinkedList;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

class DiffReducer extends 
Reducer<Text, Text , Text, Text> { 

	public void reduce(Text key, Iterable<Text> values,
			Context context) throws IOException, InterruptedException {
		
		double delta = 0.0;
		
		// calculate the difference in ranks and only output non-negative value
		for(Text v: values) {
			double vd = Double.parseDouble(v.toString());
			if (delta == 0.0) {
				delta = vd;
			}
			else {
				delta = Math.max(vd - delta, delta - vd);
			}
		}

		Text outputV = new Text(Double.toString(delta));
		
		// emit the ID and the differences between ranks from two iterations
		context.write(key, outputV);
	}
}

