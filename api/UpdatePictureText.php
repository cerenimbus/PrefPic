<?php
// Cerenimbus Inc
// 1175 N 910 E, Orem UT 84097
// THIS IS NOT OPEN SOURCE.  DO NOT USE WITHOUT PERMISSION
/*
UpdatePictureText
*/

$debugflag = false;

// this stops the java scrip from being written because this is a microservice API
$suppress_javascript= true;

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

 debug("UpdatePictureText");

//-------------------------------------
// Get the values passed in
$device_ID  		= urldecode( $_REQUEST["DeviceID"] ); //-alphanumeric up to 60 characters which uniquely identifies the mobile device (iphone, ipad, etc)
$requestDate   		= $_REQUEST["Date"];	//- date/time as a string � alphanumeric up to 20 [format:  MM/DD/YYYY HH:mm]
$authorization_code	= $_REQUEST["AC"];//- date/time as a string � alphanumeric up to 20 [format:  MM/DD/YYYY HH:mm]
$key   				= $_REQUEST["Key"];// � alphanumeric 40, SHA-1 hash of Mobile Device ID + date string + secret phrase
$prefpic_version 	= $_REQUEST["PrefPicVersion"]; // PrefPicVersion
$picture_serial 	= $_REQUEST["Picture"]; // Picture serial number to be updated
$picture_name 		= $_REQUEST["Name"]; // Picture name
$picture_note 		= $_REQUEST["Note"]; // Picture note
$hash = sha1($device_ID . $requestDate . $authorization_code);

// RKG 11/30/2013
// make a log entry for this call to the web service
// compile a string of all of the request values
$text= var_export($_REQUEST, true);
//RKG 3/10/15 clean quote marks
$test = str_replace(chr(34), "'", $text);
$log_sql= 'insert web_log SET method="UpdatePictureText", text="'. $text. '", created="' . date("Y-m-d H:i:s") .'"';
debug("Web log:" .$log_sql);


// FOR TESTING ONLY  write the values back out so we can see them
debug(
"Device ID: ".$device_ID  	."<br>".
"requestDate "  .$requestDate ."<br>".
"Authorization code: ". $authorization_code  ."<br>".
// "action	". 		$action."<br>".
// "count	". 		$count."<br>".
// "list	". 		$list ."<br>".
'Key: '. $key   			."<br>".
'Hash '. $hash  			."<br>"
);



// RKG 12/1/13  Security key checks out.  Now check to see if the authorization code
// is valid.
// If the level is 100+ then set the longitude and lattitude
// Otherwise, check to see if the longitutde and latitude can be authorized


// Check the security key
// GENIE 04/22/14 - change: echo xml to call send_output function
if( $hash != $key){
	debug( "hash error ". 'Key / Hash: <br>'. $key ."<br>". $hash."<br>");
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

//*********************************************************************************
//*********************************************************************************
// STUB- for testing only.  Remove this section
// $output = '<ResultInfo>
// <ErrorNumber>0</ErrorNumber>
// <Result>Success</Result>
// <Message>Picture Text Updated</Message>
// </ResultInfo>';

// send_output($output);
// exit;

//*********************************************************************************
//*********************************************************************************


// RKG 11/20/2015 make sure they have the currnet software version.  This is hard coded for now.
$current_prefpic_version = get_setting("system","current_mobile_version");
debug("current_prefpic_version = " . $current_prefpic_version );
if ( $current_prefpic_version > $prefpic_version){
	$output = "<ResultInfo>
		<ErrorNumber>106</ErrorNumber>
		<Result>Fail</Result>
		<Message>".get_text("vcservice", "_err106")."</Message>
		</ResultInfo>";
	send_output($output);
	exit;
}

// RKG  1/1/14check for longitude and latitide <> 0 if geocode level requires it
// Rkg if error, write out API response.
// 	if( $latitude==0 or $longitude == 0){
// 		// GENIE 04/22/14 - change: echo xml to call send_output function
// 		$output = "<ResultInfo>
// <ErrorNumber>205</ErrorNumber>
// <Result>Fail</Result>
// <Message>".get_text("vcservice", "_err205")."</Message>
// </ResultInfo>";
// 	send_output($output);
// 	exit;
// 	}

// RKG 11/6/24 - Get the emmployee based on the authorization code
// don't allow expired authorization code
$sql= 'select * from authorization_code join user on authorization_code.user_serial = user.user_serial where user.deleted_flag=0 and authorization_code.authorization_code="' . $authorization_code. '"';
debug("get the code: " . $sql);

// Execute the insert and check for success
$result=mysqli_query($mysqli_link,$sql);
if ( mysqli_error($mysqli_link)) {
	debug("line q144 sql error ". mysqli_error($mysqli_link));
	debug("exit 146");
	exit;
}
$authorization_row = mysqli_fetch_assoc($result);
$user_serial = $authorization_row["user_serial"];
$subscriber_serial = $authorization_row["subscriber_serial"];

debug("user Serial: ".$user_serial );
debug("Subscriber Serial: ".$subscriber_serial );

// IAN 10/02/25 - Update the picture text
// Update picture name and note
$sql = 'UPDATE picture SET picture_name = "' . $picture_name . '", picture_note = "' . $picture_note . '" WHERE picture_serial = "' . $picture_serial . '"';
$result = mysqli_query($mysqli_link, $sql);

if (mysqli_error($mysqli_link)) {
    debug("SQL error: " . mysqli_error($mysqli_link));
    $output = "<ResultInfo>
                <ErrorNumber>104</ErrorNumber>
                <Result>Fail</Result>
                <Message>Database update failed</Message>
               </ResultInfo>";
    send_output($output);
    exit;
}

	// GENIE 04/22/14 - change: echo xml to call send_output function
	$output = '<ResultInfo>
<ErrorNumber>0</ErrorNumber>
<Result>Success</Result>
<Message>Picture Text Updated Successfully</Message>
</ResultInfo>';

	send_output($output);
	exit;

?>


