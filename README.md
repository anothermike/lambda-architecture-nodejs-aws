# Lambda-Architecture in Node.JS and AWS

This repository is to be meant as a starting point if you want to set up a [Lambda Big Data Architecture](https://en.wikipedia.org/wiki/Lambda_architecture) based on Node.JS(https://nodejs.org/en/).
Herefore, you find a basic AWS-Lambda function reading and writing from/to S3 which can be taken as starting point for the batch layer. 
Another AWS-Lambda function represents the speed layer reading events from Kinesis and writing data to Dynamo-DB. The data from the speed layer is visualized in a Dashboard reading data from Dynamo-DB by an ORM. 


Install AWS command line tools locally
 * brew install awscli on MacOS
 * Ensure that you configure one "eu-west-1"

Setting up Batch Layer - S3 to S3
=================================

1. Create buckets "<your_domain>-lambda-demo-output" and "<your_domain>-lambda-demo-input" in your AWS account
2. Upload data to bucket e.g. configure a logstash (version >= 1.5.3) to upload your access logs
3. Create zip-file of lambda function
	* zip -r BatchS3toS3.zip BatchS3toS3.js node_modules/
4. Create new lambda function: Lambda > Functions
	* Click on "Create a Lambda function"
	* Click on "Skip"
	* Fill out
		* Name: "batch-lambda"
		* Runtime: Node.js
		* Select "Upload a .ZIP file"
		* Upload BatchS3toS3.zip
		* Handler: BatchS3toS3.handler
		* Role: Select "Create new role > S3 execution role", a popus open, click on "Allow", popup is closed and lambda_s3_exec_role is entered automatically as Role
		* Click on "Next"
		* Click on "Create function" in screen "Step 3: Review"
5. In S3 
	* Select input bucket
	* Click on "Properties"
	* Select "Events"
	* Select "Lambda function"
	* Events: Add "Put"
	* Select "batch-lambda"
6. Test it
  * Upload a file to your input bucket
	* Use the button "Test" to test the processing of the file, before add the filename and the bucket name to the test event
	
	
Setting up Speed Layer - Kinesis to DynamoDB
============================================
	
1. Create stream "com-sevenval-speed-stream" in Amazon Kinesis > Create Stream
	* Stream Name: com-sevenval-speed-stream
	* Number of Shards: 1
	* Click on "Create", wait until it is active
2. Create a role for the speed lambda function	
	* Go to IAM > Roles
	* Click on "Create New Role"
	* Role Name: speed-layer-role
	* Click on "Next Step"
	* Select role "AWS Lambda"
	* Attach Policy
		* AmazonDynamoDBFullAccess
		* AWSLambdaKinesisExecutionRole
	* Click on "Next Step"
	* Click on "Create Role"
3. Create DynamoDB table
	* Click on "Create Table"
	* Table Name: com-sevenval-lambda-demo-events
	* Hash Attribute Name (String): timestamp
	* Range Attribute Name (String): type
	* Click on "Continue"
	* Index Hash Key: timestamp
	* Index Range Key: type
	* Click on "Add Index To Table"
	* Click on "Continue"
	* Read Capacity Units: 5
	* Write Capacity Units: 5
	* Click on "Continue"
	* Click on "Continue"
	* Click on "Create"
		
4. Create new lambda function: Lambda > Functions
	* Click on "Create a Lambda function"
	* Click on "Skip"
	* Fill out
		* Name: "speed-lambda"
		* Runtime: Node.js
		* Select "Upload a .ZIP file"
		* Upload SpeedKinesisToDynamo.zip
		* Handler: SpeedKinesisToDynamo.handler
		* Role: Select role "speed-layer-role"
		* Click on "Next"
		* Click on "Create function" in screen "Step 3: Review"	
		* Click on "Events Sources"
		* Select "Kinesis" as Event source type
		* Select "com-sevenval-speed-stream" as Kinesis stream
		* To Test
			* Click "Actions > Configure sample event"
```javascript			
{
  "Records": [
    {
      "kinesis": {
        "kinesisSchemaVersion": "1.0",
        "partitionKey": "string",
        "sequenceNumber": "49553160722228756741999015917536337800373490248532885506",
        "data": "eyJpZCI6IjU1YzA5NjYxNWZhZDYiLCJ0aW1lc3RhbXAiOiIyMDE1LTA4LTA0VDEyOjM5OjI5KzAyOjAwIiwidHlwZSI6ImxvZ2lucyIsImZkeF9zZXNzaW9uX2lkIjoiVmJpSXdRVUpmTG9BQUJmZjJsNEFBQUVYIiwiZmR4X3JlcXVlc3RfaWQiOiJWY0NXWUFVSmZMb0FBRGYySTI4QUFBQ28iLCJ1c2VyX2lkIjoiMSIsInBheWxvYWQiOiJ7XCJsb2dpblwiOntcInRyYWNraW5nX2lkXCI6XCI1NWIxZWU0NmMyYzQ4NC41OTk0Njg2MFwiLFwidXNlcl9pZFwiOlwiMVwiLFwibG9naW5cIjpcIm1pY2hhXCIsXCJlbWFpbFwiOlwibXdpdHRrZUB3ZWIuZGVcIixcInNvdXJjZVwiOlwid2ViXCIsXCJkZXZpY2VfaWRcIjpcIlwiLFwiYWdlXCI6MzUsXCJzZXhcIjpcIm1cIixcInNraW5cIjpcImZwX2JzXCIsXCJmZHhfc2Vzc2lvbl9pZFwiOlwiVmJpSXdRVUpmTG9BQUJmZjJsNEFBQUVYXCJ9fSJ9"
      },
      "eventSource": "aws:kinesis",
      "eventVersion": "1.0",
      "eventID": "shardId-000000000000:49553160722228756741999015917536337800373490248532885506",
      "eventName": "aws:kinesis:record",
      "invokeIdentityArn": "arn:aws:iam::003689786749:role/kinesisDynamo-LambdaExecRole-1LXKZAXF8QQQP",
      "awsRegion": "eu-west-1",
      "eventSourceARN": "arn:aws:kinesis:eu-west-1:003689786749:stream/com-sevenval-speed-stream"
    }
  ]
}
```

5. Dashboard
	- Edit home.js in the dashboard/controller folder and enter your AWS credentials
	- Start dashbaord by node app.js

6. Events
	- Start firing events by going to the event-generator folder
	- Enter grunt generateEvents 




Now you should see data in your DynamoDB table and your dashboard.



