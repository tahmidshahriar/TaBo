import java.io.IOException;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

class FiniReducer extends Reducer<DoubleWritable, Text, Text, Text> {

	public void reduce(DoubleWritable key, Iterable<Text> values, Context context)
			throws IOException, InterruptedException {
		
		// restore the true rank
		double rank = key.get() * (-1);
		
		Text outputV = new Text(Double.toString(rank));

		// from highest rank to lowest rank, emit the ID's associated with them
		// take care of potentially ID's with tied ranks
		for (Text v : values) {
			String s = v.toString();
			Text outputK = new Text(s);
			context.write(outputK, outputV);
		}
		
	}
}
