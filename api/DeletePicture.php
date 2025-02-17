<?php
// Cerenimbus Inc
// 1175 N 910 E, Orem UT 84097
// THIS IS NOT OPEN SOURCE.  DO NOT USE WITHOUT PERMISSION

$debugflag = false;
$suppress_javascript = true;

if (file_exists('ccu_include/ccu_function.php')) {
    require_once('ccu_include/ccu_function.php');
} else {
    if (!file_exists('../ccu_include/ccu_function.php')) {
        echo "Cannot find required file ../ccu_include/ccu_function.php.  Contact programmer.";
        exit;
    }
    require_once('../ccu_include/ccu_function.php');
}

require_once('send_output.php');

// Get the values passed in
$device_ID   = urldecode($_REQUEST["DeviceID"]);
$requestDate = $_REQUEST["Date"];
$authorization_code  = $_REQUEST["AC"];
$key            = $_REQUEST["Key"];
$prefpic_version = $_REQUEST["PrefPicVersion"];
$picture_serial = $_REQUEST["Picture"];  // Picture serial number to be deleted
$hash = sha1($device_ID . $requestDate . $authorization_code);

// Log the request for debugging purposes
$text = var_export($_REQUEST, true);
$test = str_replace(chr(34), "'", $text);
$log_sql = 'insert web_log SET method="DeletePicture", text="'. $text. '", created="' . date("Y-m-d H:i:s") . '"';
debug("Web log:" . $log_sql);

debug(
    "Device ID: ".$device_ID  	."<br>".
    "Prefpic Version: ".$prefPicVersion     ."<br>".
    "requestDate: "  .$requestDate ."<br>".
    "Authorization code: ". $authorization_code  ."<br>".
    'Key: '. $key   			."<br>".
    'Hash: '. $hash  			."<br>"
    );

// Check the security hash
if ($hash != $key) {
    debug("hash error " . 'Key / Hash: <br>' . $key . "<br>" . $hash . "<br>");
    $output = "<ResultInfo>
        <ErrorNumber>102</ErrorNumber>
        <Result>Fail</Result>
        <Message>Hash mismatch error.</Message>
        </ResultInfo>";
    send_output($output);
    exit;
}

// Check if the user has the current version of the app
$current_prefpic_version = get_setting("system", "current_mobile_version");
debug("current_prefpic_version = " . $current_prefpic_version);
if ($current_prefpic_version > $prefpic_version ) {
    $output = "<ResultInfo>
        <ErrorNumber>106</ErrorNumber>
        <Result>Fail</Result>
        <Message>Outdated mobile version. Please update your app.</Message>
        </ResultInfo>";
    send_output($output);
    exit;
}

// Validate the authorization code and get the subscriber details
$sql = 'SELECT * FROM authorization_code '.
    'JOIN user ON authorization_code.user_serial = user.user_serial '.
    'WHERE user.deleted_flag = 0 '.
    'AND authorization_code.authorization_code = "' . $authorization_code . '"';

debug("get the code: " . $sql);

$result = mysqli_query($mysqli_link, $sql);
if (mysqli_error($mysqli_link)) {
    debug("SQL error: " . mysqli_error($mysqli_link));
    exit;
}
$authorization_row = mysqli_fetch_assoc($result);
$user_serial = $authorization_row["user_serial"];
$subscriber_serial = $authorization_row["subscriber_serial"];
debug("user Serial: " . $user_serial);
debug("Subscriber Serial: " . $subscriber_serial);

// Update the picture's deleted flag to 1 (mark it as deleted)
$sql = 'UPDATE picture SET deleted_flag = 1 WHERE picture_serial = "' . $picture_serial . '"';
$result = mysqli_query($mysqli_link, $sql);

if (mysqli_error($mysqli_link)) {
    debug("SQL error: " . mysqli_error($mysqli_link));
    $output = "<ResultInfo>
                <ErrorNumber>104</ErrorNumber>
                <Result>Fail</Result>
                <Message>Database update failed. Could not delete the picture.</Message>
               </ResultInfo>";
    send_output($output);
    exit;
}

// Return success message
$output = "<ResultInfo>
    <ErrorNumber>0</ErrorNumber>
    <Result>Success</Result>
    <Message>Picture deleted successfully.</Message>
</ResultInfo>";

send_output($output);
exit;
?>
