// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var util = require('util');

var table = new AWS.DynamoDB();

exports.handler = function(event, context) {
	var records = event.Records;
	
	var record = event.Records[0];
	if (record.kinesis) {

  	async.waterfall([
    function transform(next) {
  		var lines = records
      .map(function(record) {
          return new Buffer(record.kinesis.data, 'base64').toString('utf8');
      });
			
			var item = null;
			for(var line in lines) {
				if (lines[line].trim() != '') {
	        var data = JSON.parse(lines[line]);
	        item = data;
				}
      }
      next(null, item);
    },
    function upload(item, next) {
			if (!item) {
				return next("No item vorhanden");
			}
			
			var storedItem = {
				"timestamp": {"S": item.timestamp },
				"type": {"S": item.type }	
	  	};
			
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
      }

      context.done();
    }
  );
	
	}
};
