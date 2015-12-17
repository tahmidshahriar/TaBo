import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;

import org.apache.commons.lang3.StringUtils;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

/*
 * IterReducer
	Input: 
	u#tahmids	[“0.25#changbo”,“~u#changbo;i#drinking;a#penn;“]
i#cycling	[“0.25#changbo”,“~u#changbo;“]
i#singing	[“0.25#changbo”,“~u#changbo;“]
a#penn	[“0.25#changbo”,”0.33#tahmids”, “~u#changbo;u#tahmids;”]
u#changbo	[“0.33#tahmids”, “~u#tahmids;i#cycling;i#singing;a#penn;”]
i#drinking	[“0.33#tahmids”, “~u#tahmids;”]

Output:    (for each key; add together the weights from each user) (trivial in this particular example)
(for each vertex; need to build a HashMap to sum weights associated with each user)
u#tahmids	0.25#changbo~u#changbo;i#drinking;a#penn;
i#cycling	0.25#changbo~u#changbo;
i#singing	0.25#changbo~u#changbo;
a#penn	0.25#changbo;0.33#tahmids~u#changbo;u#tahmids;
u#changbo	0.33#tahmids~u#tahmids;i#cycling;i#singing;a#penn;
i#drinking	0.33#tahmids~u#tahmids;
 */

class IterReducer extends Reducer<Text, Text, Text, Text> {

	public void reduce(Text key, Iterable<Text> values, Context context)
			throws IOException, InterruptedException {
		
		String adjacency = "";
		HashMap<String, Double> summedWeights = new HashMap<String, Double>();
		LinkedList<String> outLabels = new LinkedList<String>();

		for (Text v : values) {
			String s = v.toString();
			if (s.charAt(0) == '~') {
				adjacency = adjacency + s;
			}
			else {
				String[] frags = s.split("#");
				double w = Double.parseDouble(frags[0]);
				String label = frags[1];
				if (summedWeights.containsKey(label)) {
					double oldWeight = summedWeights.get(label);
					summedWeights.put(label, (oldWeight + w));
				}
				else {
					summedWeights.put(label, w);
				}
				
			}
		}
		
		for (String l: summedWeights.keySet()) {
			outLabels.add(
					Double.toString(summedWeights.get(l))  + "#" + l);
		}
		
		String outV = "";
		for (String ol: outLabels) {
			outV = outV + ol + ";";
		}
		
		outV = outV + adjacency;
		
		context.write(key, new Text(outV));
	}
}
