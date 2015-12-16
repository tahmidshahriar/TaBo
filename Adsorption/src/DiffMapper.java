

import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

/*
input:
u#tahmids	0.25#changbo~u#changbo;i#drinking;a#penn
i#cycling	0.25#changbo~u#changbo
i#singing	0.25#changbo~u#changbo
a#penn	0.25#changbo;0.33#tahmids~u#changbo;u#tahmids
u#changbo	0.33#tahmids~u#tahmids;i#cycling;i#singing;a#penn
i#drinking	0.33#tahmids~u#tahmids

output: 
u#tahmids	0.25#changbo
i#cycling	0.25#changbo
i#singing	0.25#changbo
a#penn	0.25#changbo;0.33#tahmids
u#changbo	0.33#tahmids
i#drinking	0.33#tahmids
*/


class DiffMapper extends 
Mapper<LongWritable, Text , Text, Text> { 
	
	public void map(LongWritable key, Text value, Context context)
			throws IOException, InterruptedException {
		
		String vString = value.toString();
		String[] vKV = vString.split("\t");

		String k = vKV[0];
		String[] vFrags = vKV[1].split("~");
		
	    // output the vertex ID as key and weights as value
		context.write(new Text(k), new Text(vFrags[0]));
	}
}
