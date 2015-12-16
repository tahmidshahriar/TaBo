import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;

public class AdsorptionDriver {

	private static int doInitjob(String[] args) throws Exception {
		// Create a configuration
		Configuration conf = new Configuration();

		// Create a job
		Job initJob = new Job(conf, "init job");
		initJob.setJarByClass(AdsorptionDriver.class);

		int numRed;
		try {
			numRed = Integer.parseInt(args[3]);
		} catch (Exception e) {
			numRed = 1;
		}
		initJob.setNumReduceTasks(numRed);

		// Set Mapper and Reducer classes
		initJob.setMapperClass(InitMapper.class);
		initJob.setReducerClass(InitReducer.class);

		// Set final and intermediate output key and value classes
		initJob.setOutputKeyClass(Text.class);
		initJob.setOutputValueClass(Text.class);
		initJob.setMapOutputKeyClass(Text.class);
		initJob.setMapOutputValueClass(Text.class);

		// Set input and output format classes
		initJob.setInputFormatClass(TextInputFormat.class);
		initJob.setOutputFormatClass(TextOutputFormat.class);

		// Set input and output path
		FileInputFormat.addInputPath(initJob, new Path(args[1]));

		// delete the output directory if it already exists
		deleteDirectory(args[2]);
		FileOutputFormat.setOutputPath(initJob, new Path(args[2]));

		// run the job
		int exitcode = initJob.waitForCompletion(true) ? 0 : 1;
		System.out.println("Init job done by Changbo Li (changbo)");
		return exitcode;
	}

	private static int doIterjob(String[] args) throws Exception {
		// Create a configuration
		Configuration conf = new Configuration();

		// Create a job
		Job iterJob = new Job(conf, "iter job");
		iterJob.setJarByClass(AdsorptionDriver.class);

		int numRed;
		try {
			numRed = Integer.parseInt(args[3]);
		} catch (Exception e) {
			numRed = 1;
		}
		iterJob.setNumReduceTasks(numRed);

		// Set Mapper and Reducer classes
		iterJob.setMapperClass(IterMapper.class);
		iterJob.setReducerClass(IterReducer.class);

		// Set final and intermediate output key and value classes
		iterJob.setOutputKeyClass(Text.class);
		iterJob.setOutputValueClass(Text.class);
		iterJob.setMapOutputKeyClass(Text.class);
		iterJob.setMapOutputValueClass(Text.class);

		// Set input and output format classes
		iterJob.setInputFormatClass(TextInputFormat.class);
		iterJob.setOutputFormatClass(TextOutputFormat.class);

		// Set input and output path
		FileInputFormat.addInputPath(iterJob, new Path(args[1]));

		// delete the output directory if it already exists
		deleteDirectory(args[2]);
		FileOutputFormat.setOutputPath(iterJob, new Path(args[2]));

		// run the job
		int exitcode = iterJob.waitForCompletion(true) ? 0 : 1;
		System.out.println("Iter job done by Changbo Li (changbo)");
		return exitcode;
	}

	private static double doDiffjob(String[] args) throws Exception {

		String tempPath = "myVeryRandom18536934202352Path";
		// Create a configuration
		Configuration conf = new Configuration();

		// Create a job
		Job diffJob = new Job(conf, "diff job");
		diffJob.setJarByClass(AdsorptionDriver.class);

		int numRed;
		try {
			numRed = Integer.parseInt(args[4]);
		} catch (Exception e) {
			numRed = 1;
		}
		diffJob.setNumReduceTasks(numRed);

		// Set Mapper and Reducer classes
		diffJob.setMapperClass(DiffMapper.class);
		diffJob.setReducerClass(DiffReducer.class);

		// Set final and intermediate output key and value classes
		diffJob.setOutputKeyClass(Text.class);
		diffJob.setOutputValueClass(Text.class);
		diffJob.setMapOutputKeyClass(Text.class);
		diffJob.setMapOutputValueClass(Text.class);

		// Set input and output format classes
		diffJob.setInputFormatClass(TextInputFormat.class);
		diffJob.setOutputFormatClass(TextOutputFormat.class);

		// Set input and output path
		FileInputFormat.addInputPath(diffJob, new Path(args[1]));
		FileInputFormat.addInputPath(diffJob, new Path(args[2]));

		// delete the output directory if it already exists
		deleteDirectory(tempPath);
		FileOutputFormat.setOutputPath(diffJob, new Path(tempPath));

		// run the job part 1
		int exitcode = diffJob.waitForCompletion(true) ? 0 : 1;

		// Create another configuration
		Configuration conf2 = new Configuration();

		// Create a job
		Job diffJob2 = new Job(conf2, "diff job 2");
		diffJob2.setJarByClass(AdsorptionDriver.class);

		// Set number of reducers
		diffJob2.setNumReduceTasks(1);

		// Set Mapper and Reducer classes
		diffJob2.setMapperClass(DiffMapper2.class);
		diffJob2.setReducerClass(DiffReducer2.class);

		// Set final and intermediate output key and value classes
		diffJob2.setOutputKeyClass(Text.class);
		diffJob2.setOutputValueClass(Text.class);
		diffJob2.setMapOutputKeyClass(Text.class);
		diffJob2.setMapOutputValueClass(Text.class);

		// Set input and output format classes
		diffJob2.setInputFormatClass(TextInputFormat.class);
		diffJob2.setOutputFormatClass(TextOutputFormat.class);

		// Set input and output path
		FileInputFormat.addInputPath(diffJob2, new Path(tempPath));

		// delete the output directory if it already exists
		deleteDirectory(args[3]);
		FileOutputFormat.setOutputPath(diffJob2, new Path(args[3]));
		
		// run the job
		int exitcode2 = diffJob2.waitForCompletion(true) ? 0 : 1;
		System.out.println("Diff job done by Changbo Li (changbo)");
		
		double result = readDiffResult(args[3]);
		System.out.print(result);
		return result;
	}
	
	private static int doFinijob(String[] args) throws Exception {
		// Create a configuration
		Configuration conf = new Configuration();

		// Create a job
		Job finiJob = new Job(conf, "finish job");
		finiJob.setJarByClass(AdsorptionDriver.class);

		int numRed;
		try {
			numRed = Integer.parseInt(args[3]);
		} catch (Exception e) {
			numRed = 1;
		}
		
		finiJob.setNumReduceTasks(numRed);

		// Set Mapper and Reducer classes
		finiJob.setMapperClass(FiniMapper.class);
		finiJob.setReducerClass(FiniReducer.class);

		// Set final and intermediate output key and value classes
		finiJob.setOutputKeyClass(Text.class);
		finiJob.setOutputValueClass(Text.class);
		finiJob.setMapOutputKeyClass(Text.class);
		finiJob.setMapOutputValueClass(Text.class);
		
		// Set input and output format classes
		finiJob.setInputFormatClass(TextInputFormat.class);
		finiJob.setOutputFormatClass(TextOutputFormat.class);

		// Set input and output path
		FileInputFormat.addInputPath(finiJob, new Path(args[1]));

		// delete the output directory if it already exists
		deleteDirectory(args[2]);
		FileOutputFormat.setOutputPath(finiJob, new Path(args[2]));

		// run the job
		int exitcode = finiJob.waitForCompletion(true) ? 0 : 1;
		System.out.println("Finish job done by Changbo Li (changbo)");
		return exitcode;
	}

	public static void main(String[] args) throws Exception {
		/* TODO: Your code here */
		// initialize from the command line
		// Arguments: init <inputDir> <outputDir> <#reducers>
		if (args[0].equals("init") && args.length == 4) {
			int exitcode = doInitjob(args);
			System.exit(exitcode);
		}

		// run one iteration of rank computation from the command line
		else if (args[0].equals("iter") && args.length == 4) {
			int exitcode = doIterjob(args);
			System.exit(exitcode);
		}

		// check difference between two rounds of results from the command line
		else if (args[0].equals("diff") && args.length == 5) {
			double result = doDiffjob(args);
			System.out.println("Difference is: " + Double.toString(result));
			System.exit(0);
		}

		// finish the job from the command line
		else if (args[0].equals("finish") && args.length == 4) {
			int exitcode = doFinijob(args);
			System.exit(exitcode);
		}

		// run the whole job from the command line
		else if (args[0].equals("composite") && args.length == 7) {
			String inputDir = args[1];
			String outputDir = args[2];
			String intermDir1 = args[3];
			String intermDir2 = args[4];
			String diffDir = args[5];
			String numRed = args[6];
			
			int exitcode = 0;
		    String[] initArgs = new String[4];
		    initArgs[0] = "init";
		    initArgs[1] = inputDir;
		    initArgs[2] = intermDir1;
		    initArgs[3] = numRed;

			exitcode = doInitjob(initArgs);
			
		    String[] iterArgs_1 = new String[4];
		    iterArgs_1[0] = "iter";
		    iterArgs_1[1] = intermDir1;
		    iterArgs_1[2] = intermDir2;
		    iterArgs_1[3] = numRed;
		    
		    String[] iterArgs_2 = new String[4];
		    iterArgs_2[0] = "iter";
		    iterArgs_2[1] = intermDir2;
		    iterArgs_2[2] = intermDir1;
		    iterArgs_2[3] = numRed;
		    
		    String[] diffArgs = new String[5];
		    diffArgs[0] = "diff";
		    diffArgs[1] = intermDir2;
		    diffArgs[2] = intermDir1;
		    diffArgs[3] = diffDir;
		    diffArgs[4] = numRed;
			
			double diff = Double.POSITIVE_INFINITY;
			double threshold = 30.0;
			
			while (diff > threshold) {
				exitcode = doIterjob(iterArgs_1);
				exitcode = doIterjob(iterArgs_2);
				diff = doDiffjob(diffArgs);
			}
			
		    String[] finiArgs = new String[4];
		    finiArgs[0] = "finish";
		    finiArgs[1] = intermDir2;
		    finiArgs[2] = outputDir;
		    finiArgs[3] = numRed;
		    
		    exitcode = doFinijob(finiArgs);
		    
			System.out.println("Composite job done by Changbo Li (changbo)");
		}
	

		else {
			System.err
					.println("Usage 1: init <inputDir> <outputDir> <#reducers>");
			System.err
					.println("Usage 2: iter <inputDir> <outputDir> <#reducers>");
			System.err.println("Usage 3: " +
					"diff <inputDir1> <inputDir2> <outputDir> <#reducers>");
			System.err
					.println("Usage 4: finish <inputDir> <outputDir> <#reducers>");
			System.err
					.println("Usage 5: composite <inputDir> <outputDir>" +
							" <IntermDir1> <IntermDir2> <DiffDir> <#reducers>");
			System.exit(-1);
		}
	}

	// Given an output folder, returns the first double from the first
	// part-r-00000 file
	static double readDiffResult(String path) throws Exception {
		double diffnum = 0.0;
		Path diffpath = new Path(path);
		Configuration conf = new Configuration();
		FileSystem fs = FileSystem.get(URI.create(path), conf);

		if (fs.exists(diffpath)) {
			FileStatus[] ls = fs.listStatus(diffpath);
			for (FileStatus file : ls) {
				if (file.getPath().getName().startsWith("part-r-00000")) {
					FSDataInputStream diffin = fs.open(file.getPath());
					BufferedReader d = new BufferedReader(
							new InputStreamReader(diffin));
					String diffcontent = d.readLine();
					diffnum = Double.parseDouble(diffcontent);
					d.close();
				}
			}
		}

		fs.close();
		return diffnum;
	}

	static void deleteDirectory(String path) throws Exception {
		Path todelete = new Path(path);
		Configuration conf = new Configuration();
		FileSystem fs = FileSystem.get(URI.create(path), conf);

		if (fs.exists(todelete))
			fs.delete(todelete, true);

		fs.close();
	}

}
