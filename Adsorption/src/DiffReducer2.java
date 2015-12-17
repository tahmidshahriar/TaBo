

import java.io.IOException;
import java.util.LinkedList;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

class DiffReducer2 extends 
Reducer<Text, Text , Text, Text> { 

	public void reduce(Text key, Iterable<Text> values,
			Context context) throws IOException, InterruptedException {
		
		// Build a collection of the changes in ranks between two iterations
		LinkedList<Double> diffs = new LinkedList<Double>();
		for (Text v: values) {
			String vS = v.toString();
			diffs.add(Double.parseDouble(vS));
		}
		
		double max = Double.NEGATIVE_INFINITY;
		
		// find the maximum change
		for (Double d: diffs) {
			if (d > max) {
				max = d;
			}
		}
		
		Text outputK = new Text(Double.toString(max));
				
		// emit the maximum value as key and a trivial value
		context.write(outputK, new Text(""));
	}
}

