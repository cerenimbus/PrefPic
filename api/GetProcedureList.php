<?php
// Cerenimbus Inc
// 1175 N 910 E, Orem UT 84097
// THIS IS NOT OPEN SOURCE.  DO NOT USE WITHOUT PERMISSION
/*
GetProcedureList
*/

$debugflag = false;
// this stops the java scrip from being written because this is a microservice API
$suppress_javascript = true;

// be sure we can find the function file for inclusion
if (file_exists('ccu_include/ccu_function.php')) {
	require_once('ccu_include/ccu_function.php');
} else {
	// if we can't find it, terminate
	if (!file_exists('../ccu_include/ccu_function.php')) {
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


debug("GetProcedureList");

//-------------------------------------
// Get the values passed in
$device_ID = urldecode($_REQUEST["DeviceID"]); //-alphanumeric up to 60 characters which uniquely identifies the mobile device (iphone, ipad, etc)
$requestDate = $_REQUEST["Date"];//- date/time as a string � alphanumeric up to 20 [format:  MM/DD/YYYY HH:mm]
$prefpic_version = $_REQUEST["PrefPicVersion"];
$authorization_code = $_REQUEST["AC"];//- date/time as a string � alphanumeric up to 20 [format:  MM/DD/YYYY HH:mm]
$key = $_REQUEST["Key"];// � alphanumeric 40, SHA-1 hash of Mobile Device ID + date string + secret phrase
debug("real esacpe strign");
$hash = sha1($device_ID . $requestDate . $authorization_code);

// RKG 11/30/2013
// make a log entry for this call to the web service
// compile a string of all of the request values
$text = var_export($_REQUEST, true);
//RKG 3/10/15 clean quote marks
$test = str_replace(chr(34), "'", $text);
$log_sql = 'insert web_log SET method="GetProcedureList", text="' . $text . '", created="' . date("Y-m-d H:i:s") . '"';
debug("Web log:" . $log_sql);


// FOR TESTING ONLY  write the values back out so we can see them
debug(
	"Device ID: " . $device_ID . "<br>" .
	"AuthroiZation code: " . $authorization_code . "<br>" .
	$requestDate . "<br>" .
	'Key: ' . $key . "<br>" .
	'Hash ' . $hash . "<br>"
);
/*
//*********************************************************************************
//*********************************************************************************
// STUB- for testing only.  Remove this section
$output = '<ResultInfo>
<ErrorNumber>0</ErrorNumber>
<Result>Success</Result>
<Message>Procedure list found</Message>
<Selections>
	<Procedure>
		<Name>Thoracotamy</Name>
		<Serial>25</Serial>
	</Procedure>
		<Procedure>
		<Name>Hip Replacement</Name>
		<Serial>999999</Serial>
	</Procedure>
	<Procedure>
		<Name>Ankle break repair with screws</Name>
		<Serial>886</Serial>
	</Procedure>
</Selections>
</ResultInfo>';

    send_output($output);
    exit;

//*********************************************************************************
//*********************************************************************************
*/

// RKG 12/1/13  Security key checks out.  Now check to see if the authorization code
// is valid.
// If the level is 100+ then set the longitude and lattitude
// Otherwise, check to see if the longitutde and latitude can be authorized


// Check the security key
// GENIE 04/22/14 - change: echo xml to call send_output function
if ($hash != $key) {
	debug("hash error " . 'Key / Hash: <br>' . $key . "<br>" .
		$hash . "<br>");

	$output = "<ResultInfo>
		<ErrorNumber>102</ErrorNumber>
		<Result>Fail</Result>
		<Message>" . get_text("vcservice", "_err102b") . "</Message>
		</ResultInfo>";
	//RKG 1/29/2020 New field of $log_comment allows the error message to be written to the web log
	$log_comment = "Hash:" . $hash . "  and Key:" . $key;
	send_output($output);
	exit;
}


// RKG 11/20/2015 make sure they have the currnet software version.  This is hard coded for now.
$current_prefpic_version = get_setting("system","current_mobile_version");
debug("current_prefpic_version = " . $current_prefpic_version);
if ($current_prefpic_version > $prefpic_version) {
	$output = "<ResultInfo>
		<ErrorNumber>106</ErrorNumber>
		<Result>Fail</Result>
		<Message>" . get_text("vcservice", "_err106") . "</Message>
		</ResultInfo>";
	send_output($output);
	exit;
}


// RKG 11/6/24 - Get the emmployee based on the authorization code
// don't allow expired authorization code
$sql = 'select * from authorization_code join user on authorization_code.user_serial = user.user_serial join subscriber on user.subscriber_serial = subscriber.subscriber_serial '
    .'where authorization_code.deleted_flag=0 and authorization_code.authorization_code="' . $authorization_code . '"';
debug("get the code: " . $sql);

// Execute the insert and check for success
$result = mysqli_query($mysqli_link, $sql);
if (mysqli_error($mysqli_link)) {
    $error =  mysqli_error($mysqli_link);
    // GENIE 04/22/14 - change: echo xml to call send_output function
    $output = "<ResultInfo>
		<ErrorNumber>103</ErrorNumber>
		<Result>Fail</Result>
		<Message>" . get_text("vcservice", "_err103a") . " " . $update_sql . " " .  $error . "</Message>
		</ResultInfo>";
    debug("Mysql error: " . $error . "  ", $sql);
    $log_comment =  $error;
    send_output($output);
    exit;
}

$authorization_row = mysqli_fetch_assoc($result);

$user_serial = $authorization_row["user_serial"];
$subscriber_serial = $authorization_row["subscriber_serial"];

debug("User Serial: " . $user_serial);
debug("Subscriber Serial: " . $subscriber_serial);


	$sql = 'Select * from  prefpic.procedure where deleted_flag=0 and subscriber_serial="'. $subscriber_serial . '" order by procedure_name' ;
	debug("Line 178 get the procedure list: " . $sql);
	// Execute the insert and check for success
	$result = mysqli_query($mysqli_link, $sql);
	// Rkg if error, write out API response.
	//if ( mysqlerr( $update_sql)) {
	if (mysqli_error($mysqli_link)) {
        $error = mysqli_error($mysqli_link);
		// GENIE 04/22/14 - change: echo xml to call send_output function
		$output = "<ResultInfo>
			<ErrorNumber>103</ErrorNumber>
			<Result>Fail</Result>
			<Message>" . get_text("vcservice", "_err103a") . " " . $update_sql . " " . $error . "</Message>
			</ResultInfo>";
		debug("Mysql error: " . $error . " -- " . $sql);
		$log_comment = $error;
		send_output($output);
		exit;
	}

$output = '<ResultInfo>
	<ErrorNumber>0</ErrorNumber>
	<Result>Success</Result>
	<Message>Procedure list found</Message>
	<Selections>';

while ($procedure_row = mysqli_fetch_assoc($result)) {
    $output .= '
	<Procedure>
		<Name>'. $procedure_row["procedure_name"].  '</Name>
		<Serial>'. $procedure_row["procedure_serial"].'</Serial>
	</Procedure>';
}

	$output .= '</Selections>
	</ResultInfo>';
	send_output($output);
	exit;


?>