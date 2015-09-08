// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var util = require('util');

// get reference to S3 client
var s3 = new AWS.S3();


/*
	Goal: 
		(1) Only take the first file
		(2) Filter the lines with the right data type
		(3) Write it back to the output bucket
*/

exports.handler = function(event, context) {
  // Read options from the event.
  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
  var srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

  var dstBucket = "com-sevenval-lambda-demo-output";
  var dstKey    = "processed-" + srcKey;

  async.waterfall([
    function download(next) {
      s3.getObject({
          Bucket: srcBucket,
          Key: srcKey
        },
        next);
      },
    function transform(response, next) {
			
      var lines = response.Body.toString().split("\n");
      var filteredResults = [];

			var filteredResults = [];
      for(var line in lines) {
				if (lines[line].trim() != '') {
	        var data = JSON.parse(lines[line]);
	        if (data.type === "fit14_access") {
	          filteredResults.push(lines[line]);
	        }
				}
        
      }
      next(undefined, "text/plain", filteredResults.join("\n"));
    },
    function upload(contentType, data, next) {
      s3.putObject({
          Bucket: dstBucket,
          Key: dstKey,
          Body: data,
          ContentType: contentType
        },
        next);
      }
    ], function (err) {
      if (err) {
        console.error(
          'Error: ' + err
        );
				context.fail(err);
      } else {
        console.log(
          'Successfully filtered ' + srcBucket + '/' + srcKey +
          ' and uploaded to ' + dstBucket + '/' + dstKey
        );
				context.succeed('Successfully filtered ' + srcBucket + '/' + srcKey +
          ' and uploaded to ' + dstBucket + '/' + dstKey);
      }

      
    }
  );
};
