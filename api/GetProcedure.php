<?php
// Cerenimbus Inc
// 1175 N 910 E, Orem UT 84097
// THIS IS NOT OPEN SOURCE.  DO NOT USE WITHOUT PERMISSION

$debugflag = false;

// this stops the java scrip from being written because this is a microservice API
$suppress_javascript = false;

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
debug("get the send output php");
// be sure we can find the function file for inclusion
if (file_exists('send_output.php')) {
    require_once('send_output.php');
} else {
    // if we can't find it, terminate
    if (!file_exists('../ccu_include/send_output.php')) {
        echo "Cannot find required file send_output.php Contact programmer.";
        exit;
    }
    require_once('send_output.php');
}

debug("GetProcedure");


//-------------------------------------
// Get the values passed in
$device_ID = urldecode($_REQUEST["DeviceID"]); //-alphanumeric up to 60 characters which uniquely identifies the mobile device (iphone, ipad, etc)
$requestDate = $_REQUEST["Date"];//- date/time as a string � alphanumeric up to 20 [format:  MM/DD/YYYY HH:mm]
$key = $_REQUEST["Key"];// � alphanumeric 40, SHA-1 hash of Mobile Device ID + date string + secret phrase
$authorization_code = $_REQUEST["AC"];//- date/time as a string � alphanumeric up to 20 [format:  MM/DD/YYYY HH:mm]
$prefpic_version = $_REQUEST["PrefPicVersion"];

//Generate Hash for security check
$hash = sha1($device_ID . $requestDate . $authorization_code);


// $procedure_serial = $_REQUEST["procedures_serial"];//added procedure_serial
$procedure_serial = $_REQUEST["Procedure"];//added Procedure



// RKG 11/30/2013
// make a log entry for this call to the web service
// compile a string of all of the request values
$text = var_export($_REQUEST, true);
//RKG 3/10/15 clean quote marks
$test = str_replace(chr(34), "'", $text);
$log_sql = 'insert web_log SET method="GetProcedure", text="' . $text . '", created="' . date("Y-m-d H:i:s") . '"';
debug("Web log:" . $log_sql);


// FOR TESTING ONLY  write the values back out so we can see them
debug(

    "This Are the Values<br>" .

    "Device ID: " . $device_ID . "<br>" .
    "requestDate " . $requestDate . "<br>" .
    'Key: ' . $key . "<br>" .
    "Authorization code: " . $authorization_code . "<br>" .
    'Hash ' . $hash . "<br>" .
    'Procedure_serial ' . $procedure_serial . "<br>"

);


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
$current_prefpic_version = get_setting("system", "current_mobile_version");
debug("current_PrefPic_version = " . $current_prefpic_version);
if ($current_prefpic_version > $prefpic_version) {
    $output = "<ResultInfo>
<ErrorNumber>106</ErrorNumber>
<Result>Fail</Result>
<Message>" . get_text("vcservice", "_err106") . "</Message>
</ResultInfo>";
    send_output($output);
    exit;
}



//**********************STUB REMOVE when testing***********************//
//**********************STUB REMOVE when testing***********************//
//**********************STUB REMOVE when testing***********************//
// $output = '<ResultInfo>
//                 <ErrorNumber>0</ErrorNumber>
//                 <Result>Success</Result>( or<Result>Fail</Result> )
//                     <Message>This Works</Message>
//                     <ProcedureSerial>1 serial number of procured added</ProcedureSerial>
//                     <Selections>
//                         <Procedure>
//                             <ProcedureName>
//                             <Always>  always_do from database</Always>
//                             <Watch> watch_for from database</Watch>
//                             <Never> never_do from database</Never>
//                             <Pictures>
//                                 <Picture>
//                                     <PictureSerial> serial number </PictureSerial>
//                                     <PictureName> name from the database </PictureName>
//                                     <PictureNote>< note from the database</PictureNote>
//                                     <Media>  the video or picture file goes here</Media>
//                                 </Picture>
//                             </Pictures>
//                         </Procedure
//                     </Selections>
//             </ResultInfo>';

// send_output($output);
// exit;
//**********************STUB REMOVE when testing***********************//
//**********************STUB REMOVE when testing***********************//
//**********************STUB REMOVE when testing***********************//



// RKG 11/6/24 - Get the emmployee based on the authorization code
// don't allow expired authorization code
$sql = 'select * from authorization_code 
        join user on authorization_code.user_serial = user.user_serial
        join subscriber on user.subscriber_serial = subscriber.subscriber_serial 
        where authorization_code.deleted_flag=0 
        and authorization_code.authorization_code="' . $authorization_code . '"';

// $sql = 'select * from user join authorization_code on user.user_serial= authorization_code.user_serial where authorization_code.deleted_flag=0  and ' .
//     ' user.deleted_flag=0 AND device_ID="' . $device_ID . '"';

debug("get the code: " . $sql);

// Execute the insert and check for success
$result = mysqli_query($mysqli_link, $sql);
if (mysqli_error($mysqli_link)) {
    debug("line q144 sql error " . mysqli_error($mysqli_link));
    debug("exit 173");
    exit;
}
$authorization_row = mysqli_fetch_assoc($result);

$user_serial = $authorization_row["user_serial"];
$subscriber_serial = $authorization_row["subscriber_serial"];

debug("User Serial: " . $user_serial);
debug("Subscriber Serial: " . $subscriber_serial);



//check if procedure_serial is passed 
if (empty($procedure_serial)) {
    $output = "<ResultInfo>
<ErrorNumber>104</ErrorNumber>
<Result>Fail</Result>
<Message>Procedure serial is required.</Message>
</ResultInfo>";
    send_output($output);
    exit;
}
debug("Procedure Serial: " . $procedure_serial);


//JOHN 12/02/25 check procedure and subscriber
$sql = " select * from prefpic.procedure
        where procedure_serial = '$procedure_serial' 
        and subscriber_serial = '$subscriber_serial' ";

$result = mysqli_query($mysqli_link, $sql);
if (mysqli_num_rows($result) == 0) {
    $output = "<ResultInfo>
<ErrorNumber>202</ErrorNumber>
<Result>Fail</Result>
<Message>Procedure does not belong to the subscriber.</Message>
</ResultInfo>";
    send_output($output);
    exit;
}


//JOHN 12/02/25 get all pic from the procedure
$sql = "select * from prefpic.procedure 
        join picture on procedure.procedure_serial = picture.procedure_serial 
        where procedure.procedure_serial =  '$procedure_serial'";

$result = mysqli_query($mysqli_link, $sql);
if (mysqli_error($mysqli_link)) {
    debug("line 250 sql error " . mysqli_error($mysqli_link));
    debug("exit 257");
    exit;
}

$output = '<ResultInfo>
    <ErrorNumber>0</ErrorNumber>
    <Result>Success</Result>
    <Message>Procedure details retrieved successfully.</Message>
    <ProcedureSerial>' . $procedure_serial . '</ProcedureSerial>
    <Selections>
        <Procedure>
            <ProcedureName></ProcedureName>
            <Always>  always_do from database</Always>
			<Watch> watch_for from database</Watch>
			<Never> never_do from database</Never>
            <Pictures>';

while ($row = $result->fetch_assoc()) {
    $output .= '
                <Picture>
                    <PictureSerial>' . $row["picture_serial"] . '</PictureSerial>
                    <PictureName>' . $row["picture_name"] . '</PictureName>
                    <PictureNote>' . $row["picture_note"] . '</PictureNote>
                    <Media>' . $row["media"] . '</Media>
                </Picture>';
}

$output .= '
            </Pictures>
        </Procedure>
    </Selections>
</ResultInfo>';

send_output($output);
exit;

?>