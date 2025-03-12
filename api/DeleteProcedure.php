<?php
// Cerenimbus Inc
// 1175 N 910 E, Orem UT 84097
// THIS IS NOT OPEN SOURCE.  DO NOT USE WITHOUT PERMISSION
/*
UpdateQuote
Get a list of open quotes (not converted into a job).  If there is a search term included then it will be used to search.
If there is no search term then a list will be returned with he first one being the quote closest to the mobile use,
and followed by the 5 most recently viewed quotes.
*/

$debugflag = false;

// this stops the java scrip from being written because this is a microservice API
$suppress_javascript= false;

// be sure we can find the function file for inclusion
if ( file_exists( 'ccu_include/ccu_function.php')) {
	require_once( 'ccu_include/ccu_function.php');
} else {
	// if we can't find it, terminate
	if ( !file_exists('../ccu_include/ccu_function.php')){
		echo "Cannot find required file ../ccu_include/ccu_function.php.  Contact programmer.";
		exit;
	}
	require_once('../ccu_include/ccu_function.php');
}


// GENIE 04/22/14 (from DeAuthorizeVoter.php)
// this function is used to output the result and to store the result in the log
debug( "get the send output php");
// be sure we can find the function file for inclusion
if ( file_exists( 'send_output.php')) {
	require_once( 'send_output.php');
} else {
	// if we can't find it, terminate
	if ( !file_exists('../ccu_include/send_output.php')){
		echo "Cannot find required file send_output.php Contact programmer.";
		exit;
	}
	require_once('send_output.php');
}

debug("UpdateProcedure");

//-------------------------------------
// Get the values passed in
$device_ID  	= urldecode( $_REQUEST["DeviceID"]); //-alphanumeric up to 60 characters which uniquely identifies the mobile device (iphone, ipad, etc)
$requestDate   	= $_REQUEST["Date"];//- date/time as a string � alphanumeric up to 20 [format:  MM/DD/YYYY HH:mm]
// $crSSewzcontrol_version = $_REQUEST["CrewzControlVersion"];
$authorization_code 	= $_REQUEST["AC"];//- date/time as a string � alphanumeric up to 20 [format:  MM/DD/YYYY HH:mm]
$key   			= $_REQUEST["Key"];// � alphanumeric 40, SHA-1 hash of Mobile Device ID + date string + secret phrase
$prefpic_version = $_REQUEST["PrefPicVersion"];
$procedure_serial = $_REQUEST["Serial"];
// get the new values for updates


$hash = sha1($device_ID . $requestDate.$authorization_code  );

// FOR TESTING ONLY  write the values back out so we can see them
debug(
"Device ID: ".$device_ID  	."<br>".
"AuthroiZation code: ". $authorization_code  ."<br>".
"requestDate "  .$requestDate ."<br>".
"Procedure Serial "  .$procedure_serial ."<br>".
'Key: '. $key   			."<br>".
'Hash '. $hash  			."<br>"
);



// RKG 12/1/13  Security key checks out.  Now check to see if the authorization code
// is valid.
// If the level is 100+ then set the longitude and lattitude
// Otherwise, check to see if the longitutde and latitude can be authorized


//-------------------------------------
// RKG 11/30/2013
// make a log entry for this call to the web service
// compile a string of all of the request values
$text= var_export($_REQUEST, true);
//RKG 3/10/15 clean quote marks
$test = str_replace(chr(34), "'", $text);
$log_sql= 'insert web_log SET method="DeleteProcedure", text="'. $text. '", created="' . date("Y-m-d H:i:s") .'"';
debug("Web log:" .$log_sql);


// Check the security key
// GENIE 04/22/14 - change: echo xml to call send_output function
if( $hash != $key){
	debug( "hash error ". 'Key / Hash: <br>'. $key ."<br>".
$hash."<br>");

	$output = "<ResultInfo>
<ErrorNumber>102</ErrorNumber>
<Result>Fail</Result>
<Message>". get_text("vcservice", "_err102b")."</Message>
</ResultInfo>";
	//RKG 1/29/2020 New field of $log_comment allows the error message to be written to the web log
	$log_comment= "Hash:".$hash."  and Key:". $key;
	send_output($output);
	exit;
}
/*
//*********************************************************************************
//*********************************************************************************
// STUB- for testing only.  Remove this section
$output = '<ResultInfo>
<ErrorNumber>0</ErrorNumber>
<Result>Success</Result>
<Message>Procedure Updated</Message>
</ResultInfo>';

send_output($output);
exit;

//*********************************************************************************
//*********************************************************************************
*/


// RKG 11/20/2015 make sure they have the currnet software version.  This is hard coded for now.

$current_prefpic_version = get_setting("system","current_mobile_version");
debug("current_PrefPic_version = " . $current_prefpic_version );
if ( $current_prefpic_version > $prefpic_version){
	$output = "<ResultInfo>
<ErrorNumber>106</ErrorNumber>
<Result>Fail</Result>
<Message>".get_text("vcservice", "_err106")."</Message>
</ResultInfo>";
	send_output($output);
	exit;
}


// RKG 11/6/24 - Get the emmployee based on the authorization code
// don't allow expired authorization code
$sql = 'SELECT subscriber.subscriber_serial 
        FROM authorization_code 
        JOIN user ON authorization_code.user_serial = user.user_serial 
        JOIN subscriber ON user.subscriber_serial = subscriber.subscriber_serial 
        WHERE user.deleted_flag = 0 
        AND authorization_code.deleted_flag = 0 
        AND authorization_code.authorization_code = "' . $authorization_code . '"';
debug("line 151 get the code: " . $sql);

// Execute the insert and check for success
$result=mysqli_query($mysqli_link,$sql);
if (!mysqli_query($mysqli_link, $sql)) {
	$error = mysqli_error($mysqli_link);
	$output = "<ResultInfo>
<ErrorNumber>103</ErrorNumber>
<Result>Fail</Result>
<Message>Error updating procedure: " . $error . $sql ."</Message>
</ResultInfo>";
	send_output($output);
	exit;
}
$authorization_row = mysqli_fetch_assoc($result);

$user_serial = $authorization_row["user_serial"];
$subscriber_serial = $authorization_row["subscriber_serial"];

/*
// Check if the procedure serial belongs to the subscriber
$sql = 'SELECT * FROM prefpic.procedure 
        WHERE deleted_flag = 0 
        AND subscriber_serial = "' . $subscriber_serial . '" 
        AND procedure_serial = "' . $procedure_serial . '"';

$result = mysqli_query($mysqli_link, $sql);
if (!$result || mysqli_num_rows($result) == 0) {
    $output = "<ResultInfo>
<ErrorNumber>202</ErrorNumber>
<Result>Fail</Result>
<Message>Procedure does not belong to subscriber</Message>
</ResultInfo>";
    send_output($output);
    exit;
}
*/


//update the procedure information
$update_sql = 'UPDATE prefpic.procedure '.
               'SET deleted_flag=1'.
               ' WHERE procedure_serial="' . $procedure_serial . '"';
debug( "Line 194 ".$update_sql );

if (!mysqli_query($mysqli_link, $update_sql)) {
    $error = mysqli_error($mysqli_link);
    $output = "<ResultInfo>
<ErrorNumber>103</ErrorNumber>
<Result>Fail</Result>
<Message>Error updating procedure: " . $error . "</Message>
</ResultInfo>";
    send_output($output);
    exit;
}


// Return updated procedure serial
$output = "<ResultInfo>
<ErrorNumber>0</ErrorNumber>
<Result>Success</Result>
<Message>Procedure deleted successfully</Message>
<ProcedureSerial>" . $procedure_serial . "</ProcedureSerial>
</ResultInfo>";

send_output($output);
exit;


?>


