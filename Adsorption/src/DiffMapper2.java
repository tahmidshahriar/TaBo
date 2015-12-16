

import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

class DiffMapper2 extends 
Mapper<LongWritable, Text , Text, Text> { 
	
	public void map(LongWritable key, Text value, Context context)
			throws IOException, InterruptedException {
		
		String vString = value.toString();
		String[] vKV = vString.split("\t");
		String difference = vKV[1];
		
		// emit the change in rank calculated in the first diff MapReduce
		// for each ID
		context.write(new Text("placeholder"), new Text(difference));
	}
}
