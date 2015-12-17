import java.io.IOException;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.TreeMap;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

/*
Input: 
changbo	[“0.25~u#tahmids”,”0.5~u#bianca”]
tahmids	[“0.33~u#changbo”]

Sample Output:
changbo	tahmids~changbo~lcbphilip~test~test2
lcbphilip	tahmids~changbo~lcbphilip~test~test2
tahmids	tahmids~lcbphilip~changbo~test~test2
test	tahmids~changbo~lcbphilip~test~test2
test2	tahmids~changbo~lcbphilip~test~test2
 */

class FiniReducer extends Reducer<Text, Text, Text, Text> {

	public void reduce(Text key, Iterable<Text> values, Context context)
			throws IOException, InterruptedException {
		
		Comparator<Double> descending = new Comparator<Double>() {
			
			// customized comparator that sorts doubles in descending order 
			public int compare(Double d1, Double d2) {
				if (d1 > d2) {
					return -1;
				}
				else if (d1 < d2) {
					return 1;
				}
				else {return 0;}
			}
		};
		
		// take advantage of TreeMap's built-in key sorting
		TreeMap<Double, LinkedList<String>> descMap = 
				new TreeMap<Double, LinkedList<String>>(descending);
		

		// from highest label value to lowest, append the usernames associated 
		// with them to a list associated with the label origin
		// take care of potentially usernames with tied ranks
		
		for (Text v : values) {

			String s = v.toString();
			String[] sFrags = s.split("~");
			String username = sFrags[1].split("#")[1];
			double weight = Double.parseDouble(sFrags[0]);
			
			// keep a list of friends for each weight to take care of possible ties
			if (descMap.containsKey(weight)) {
				descMap.get(weight).add(username);
			}
			else {
				LinkedList<String> userList = new LinkedList<String>();
				userList.add(username);
				descMap.put(weight, userList);
			}
		}
		
		String outV = "";
		
		// iterate through the keySet of the TreeMap and make a list showing
		// the friends in descending order of recommendability
		for (double w: descMap.keySet()) {
			LinkedList<String> uList = descMap.get(w);
			for (String u: uList) {
				outV = outV + u + "~";
			}
		}
		String outputV = outV.substring(0, outV.length()-1);
		
		// output a list of friends for each user
		context.write(key, new Text(outputV));
		
	}
}
