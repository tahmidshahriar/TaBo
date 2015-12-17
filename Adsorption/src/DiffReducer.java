import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

/*
Input:
u#tahmids	[“0.25#changbo”, “0.2#changbo”]
a#penn	[“0.25#changbo;0.13#tahmids”, “0.2#changbo;0.33#tahmids”]

Output: (use a HashMap at each vertex to compare the weights from two iterations)
u#tahmids	0.05
a#penn	0.2
*/

class DiffReducer extends 
Reducer<Text, Text , Text, Text> { 

	public void reduce(Text key, Iterable<Text> values,
			Context context) throws IOException, InterruptedException {
		
		// map to compare weights on the same label from different iterations
		// of the iter job
		HashMap<String, Double> compMap = new HashMap<String, Double>();
		
		// calculate the difference in weights and only output non-negative value
		for(Text v: values) {
			String vv = v.toString();
			
			String[] oneWeight = vv.split(";");
			
			for (String ow: oneWeight) {
				
				String[] frags = vv.split("#");
				
				String label = frags[1];
				double weight = Double.parseDouble(frags[0]);

				if (compMap.containsKey(label)) {
					// get the difference between the weight stored in the map
					// and the newly accessed weight
					double current = compMap.get(label);
					double updated = Math.max(current - weight, weight - current);
					compMap.put(label, updated);
				}
				else {
					// if there's no existing weight stored for the particular
					// label in the map, add the weight
					compMap.put(label, weight);
				}
			}
		}

		double maxDiff = Double.NEGATIVE_INFINITY;

		// get the maximum difference for weights of the same label between 
		// iterations by comparing the value across different labels
		for (String k: compMap.keySet()) {
			if (compMap.get(k) > maxDiff) {
				maxDiff = compMap.get(k);
			}

		}

		Text outputV = new Text(Double.toString(maxDiff));
		
		// emit the vertex and the maximum difference from two iterations
		context.write(key, outputV);
	}
}

