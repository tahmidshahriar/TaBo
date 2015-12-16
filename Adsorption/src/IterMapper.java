import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

/*
 * Input: 
u#changbo 	1#changbo~u#tahmids;i#cycling;i#singing;a#penn
u#tahmids	1#tahmids~u#changbo;i#drinking;a#penn
i#cycling	~u#changbo
i#singing	~u#changbo
i#drinking	~u#tahmids
a#penn		~u#changbo;u#tahmids

Output from changbo: (split the weight from each of the weights evenly among the edges) (also emit the adjacency list)
for instance: the emissions should be:
u#tahmids	0.25#changbo
i#cycling	0.25#changbo
i#singing	0.25#changbo
a#penn		0.25#changbo
u#changbo	0.33#tahmids
i#drinking	0.33#tahmids
a#penn		0.33#tahmids

u#changbo 	~u#tahmids;i#cycling;i#singing;a#penn
u#tahmids	~u#changbo;i#drinking;a#penn
i#cycling	~u#changbo
i#singing	~u#changbo
i#drinking	~u#tahmids
a#penn	~u#changbo;u#tahmids
 */
class IterMapper extends 
Mapper<LongWritable, Text , Text, Text> { 
	
	public void map(LongWritable key, Text value, Context context)
			throws IOException, InterruptedException {
		
		String vString = value.toString();
		String[] vKV = vString.split("\t");

		String k = vKV[0];
		
		String[] splitted = vKV[1].split("~");
		
		if (splitted.length == 2) {
			
			String[] weights = splitted[0].split(";");
			String[] targets = splitted[1].split(";");
			
			double numTargets = (double) targets.length;
			
			for (String w: weights) {
				
				String[] frags = w.split("#");
				double oldWeight = Double.parseDouble(frags[0]);
				double newWeight = oldWeight / numTargets;
				String outputWeight = 
						Double.toString(newWeight) + "#" + frags[1];
				
				for (String t: targets) {
					context.write(new Text(t), new Text(outputWeight)); 
				}
			}
		}
	    
	    // emit one K-V pair to pass the adjacency list
		context.write(new Text(k), new Text("~" + splitted[splitted.length-1])); 

		
	}
}
