// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var util = require('util');

// get reference to S3 client
//var s3 = new AWS.S3();
var table = new AWS.DynamoDB();

exports.handler = function(event, context) {
  // Read options from the event.
  console.log("1234: Reading options from event:\n", util.inspect(event, {depth: 5}));
  
	var records = event.Records;
	
	var record = event.Records[0];
	if (record.kinesis) {

  	async.waterfall([
    function transform(next) {
			
  		var lines = records
      .map(function(record) {
          return new Buffer(record.kinesis.data, 'base64').toString('utf8');
      });
			
			console.log("HUHUHU Data is");
			console.log(lines);
			
			var item = null;
			for(var line in lines) {

							console.log("line:");
							console.log(line);
			
							console.log("lines von line:");
							console.log(lines[line]);

							if (lines[line].trim() != '') {
				        var data = JSON.parse(lines[line]);
								console.log("data:");
								console.log(data);
							 
				        item = data;
				        
							}
        
      }
			
			console.log("HUHUHU2 Item is");
			console.log(item);

      next(null, item);
    },
    function upload(item, next) {
			console.log("In Upload Funktion: ");
			console.log(item);
			
			if (!item) {
				console.log("!item: ");		
				console.log(item);		
				return next("No item vorhanden");
			}
			/*
			for (var key in item) {
				if (item.hasOwnProperty(key) && (!typeof item[key] === 'string' || item[key].length === 0)) {
					return next('Invalid attribute: ' + key);
				} else {
					console.log('Valid attribute: ' + key);
				}
			}*/
			
			//if (item.id )
			
			var storedItem = {
						"timestamp": {"S": item.timestamp },
						"type": {"S": item.type }	
			  	};
			
			console.log("in PutItem", storedItem);
			table.putItem( {
				"TableName":"com-sevenval-lambda-demo-events",
			  	"Item": storedItem
			}, next);
	
			
      
			}
    ], function (err) {
      if (err) {
        console.error(
          'Error: ' + err
        );
      } else {
        console.log(
          'Successfully uploaded Records: '
        );
				//console.log(records);
      }

      context.done();
    }
  );
	
	}
};
