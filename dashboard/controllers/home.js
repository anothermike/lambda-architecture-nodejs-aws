/**
 * GET /
 * Home page.
 */
var vogels = require('vogels');
var Joi = require('joi');
var util   = require('util');
var _ = require('lodash');

vogels.AWS.config.update({accessKeyId: '<AWS-KEY>', secretAccessKey: '<AWS-ACCESS-KEY>' });
vogels.AWS.config.region = 'eu-west-1';

var LiveEvent = vogels.define('com-sevenval-lambda-demo-event', {
  hashKey : 'timestamp',
  rangeKey : 'type',
  timestamps : true,
  schema : {
    timestamp  : Joi.string(),
    type : Joi.string()
  },
});


exports.index = function(req, res) {
  res.render('home', {
    title: 'Home'
  });
};


exports.live = function(req, res) {
	var d = new Date();
	var n = d.toISOString();
	
	var current_time = n.substring(0, 18);
	
		
	console.log(current_time);	
  LiveEvent.scan()
  .where('timestamp').beginsWith(current_time)
  .exec( function(err, docs) {
			
			if (err) {
				console.log(err);
			}
			
			if (docs) {
				console.log(docs);
				
				for (i in docs.Items) {
					var item = docs.Items[i];
				
					if (item.attrs.payload) {
						payload = JSON.parse(item.attrs.payload);
						console.log(payload);
						docs.Items[i].attrs.payloadJson = payload;
					}
				}
		
    		res.render('data', { books: docs.Items });
			}
  	}

		
  );
	

};


var printResults = function (err, resp) {
  console.log('----------------------------------------------------------------------');
  if(err) {
    console.log('Error running scan', err);
  } else {
    console.log('Found', resp.Count, 'items');
    console.log(util.inspect(_.pluck(resp.Items, 'attrs')));

    if(resp.ConsumedCapacity) {
      console.log('----------------------------------------------------------------------');
      console.log('Scan consumed: ', resp.ConsumedCapacity);
    }
  }

  console.log('----------------------------------------------------------------------');
};