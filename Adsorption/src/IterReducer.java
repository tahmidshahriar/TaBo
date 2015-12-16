import java.io.IOException;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

class IterReducer extends Reducer<Text, Text, Text, Text> {

	public void reduce(Text key, Iterable<Text> values, Context context)
			throws IOException, InterruptedException {

		String targets = "";
		double rank = 0.0;

		for (Text v : values) {
			String s = v.toString();
			String[] ss = s.split(" ");
			if (ss.length > 1) {
				// if the K-V pair was emitted by the same ID,
				// collect the rank and also the list of targets
				double weight = Double.parseDouble(ss[0]);
				rank = rank + weight;
				targets = ss[1];
			} else {
				// for other K-V pairs, just collect the ranks
				double weight = Double.parseDouble(ss[0]);
				rank = rank + weight;
			}
		}

		String rankString = Double.toString(rank);

		String outputString = rankString + " " + targets;

		Text outputV = new Text(outputString);

		context.write(key, outputV);
	}
}
