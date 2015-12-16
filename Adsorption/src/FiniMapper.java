import java.io.IOException;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

class FiniMapper extends Mapper<LongWritable, Text, DoubleWritable, Text> {

	public void map(LongWritable key, Text value, Context context)
			throws IOException, InterruptedException {

		String vString = value.toString();
		String[] vKV = vString.split("\t");
		String[] vFrags = vKV[1].split(" ");
		String k = vKV[0];
		double rank = Double.parseDouble(vFrags[0]);
		
		// calculate the inverse value of the rank
		double iRank = rank * (-1);

		// emit the inverse value of rank as key so that MapReduce will sort 
		// the K-V pairs to give decreasing order of ranks
		context.write(new DoubleWritable(iRank), new Text(k));
	}
}
