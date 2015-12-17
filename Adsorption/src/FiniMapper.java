import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

/*
 * Input:    (only those with keys for users are relevant)
u#tahmids	0.25#changbo~u#changbo;i#drinking;a#penn
i#cycling	0.25#changbo~u#changbo
i#singing	0.25#changbo~u#changbo
a#penn	0.25#changbo;0.33#tahmids~u#changbo;u#tahmids
u#changbo	0.33#tahmids~u#tahmids;i#cycling;i#singing;a#penn
i#drinking	0.33#tahmids~u#tahmids

Output: (output one entry for each label that a user has)
changbo	0.25~u#tahmids
tahmids	0.33~u#changbo
 */

class FiniMapper extends Mapper<LongWritable, Text, Text, Text> {

	public void map(LongWritable key, Text value, Context context)
			throws IOException, InterruptedException {

		String vString = value.toString();
		String[] vKV = vString.split("\t");
		String location = vKV[0];
		
		// only take care of vertices that represent users
		if (location.charAt(0) == 'u') {
			String[] vFrags = vKV[1].split("~");
			if (vFrags.length == 2) {
				String[] weightLabels = vFrags[0].split(";");
				for (String wl: weightLabels) {
					String[] wlFrags = wl.split("#");
					String weight = wlFrags[0];
					String label = wlFrags[1];
					
					String outV = weight + "~" + location;
					
					// for each weight label, emit label as key
					// and vertex with the label (and the weight) as value 
					context.write(new Text(label), new Text(outV));
				}
			}
		}
	}
}
