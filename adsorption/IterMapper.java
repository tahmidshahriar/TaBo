import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

class IterMapper extends 
Mapper<LongWritable, Text , Text, Text> { 
	
	public void map(LongWritable key, Text value, Context context)
			throws IOException, InterruptedException {
		
		String vString = value.toString();
		String[] vKV = vString.split("\t");
		String[] vFrags = vKV[1].split(" ");
		String k = vKV[0];
		
	    double rank = Double.parseDouble(vFrags[0]);
	    
	    // hard-code the constant
		double d = 0.15;
		String D = Double.toString(d);
		
		String aRank = "";
		String targets = "";
	    if (vFrags.length > 1) {
	    	// calculate the number of outgoing edges and the rank to be 
	    	// allocated to each
			String[] vertices = vFrags[1].split(",");
			int numVertices = vertices.length;
			
			System.out.println(k + ": " + numVertices);
			
			double allocatedRank = rank/(double)numVertices;
			aRank = Double.toString(allocatedRank * (1.0 -d));
			targets = vFrags[1];
			
			for (String v: vertices) {
				// emit one K-V pair to pass rank to each of the target vertices
				context.write(new Text(v), new Text(aRank)); 
			}
	    }
	    
	    // emit one K-V pair to pass rank and also list of targets
	    // to the vertex itself
		context.write(new Text(k), new Text(D + " " + targets));

		
	}
}
