<?php

$con = new PDO('odbc:DRIVER={IBM I Access ODBC Driver};SYSTEM={PRIMARY-ISERIES.PRIMEINC.COM};UID={QLOASRV};PWD={8BDrOaDWO9@GM%$xy5#w};Translate={1}');
$con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

function getRealUserIp(){
    switch(true){
      case (!empty($_SERVER['HTTP_X_REAL_IP'])) : return $_SERVER['HTTP_X_REAL_IP'];
      case (!empty($_SERVER['HTTP_CLIENT_IP'])) : return $_SERVER['HTTP_CLIENT_IP'];
      case (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) : return $_SERVER['HTTP_X_FORWARDED_FOR'];
      default : return $_SERVER['REMOTE_ADDR'];
    }
 }

function generateGUID(){
    $token  = $_SERVER['HTTP_HOST'];
    $token .= $_SERVER['REQUEST_URI'];
    $token .= uniqid(rand(), true);

    $hash = strtoupper(md5($token));

    $guid  = 'LOAPP';
    $guid .= substr($hash,  0,  8) .
    '-' .
    substr($hash, 20, 12);

    return $guid;
}

$userIP = getRealUserIp();

$now = new DateTime();
$timeStamp = $now->format('Y-m-d-H.i.s.u');

$payload = file_get_contents('php://input');
$sentInfoP = urldecode($payload);
$sentInfo = json_decode($sentInfoP);
$theGUID = generateGUID();

$driverOne = '';
$driverTwo = '';

// $currentUser = $_SERVER['REMOTE_USER'];
$currentUser = strtoupper(get_current_user());


$truckCode= substr($sentInfo->messageTruck, 0, 6);
$carrierCode = $sentInfo->messageCarrier;
$messContents = $sentInfo->messageContent;

//Grabs Driver codes based off of Truck and Carrier
$sqlGrabDriverByTruck = 'SELECT trim(LTDRV1) as DRIVERONE, trim(LTDRV2) as DRIVERTWO from EDGETSTLIB.LOAPPTRK where LTPRMCAR = :carrierCode and LTPRMTRK = :truckCode limit 1';
$getDrivers = $con->prepare($sqlGrabDriverByTruck);
$getDrivers->execute(array(":carrierCode"=>$carrierCode, ":truckCode"=>$truckCode));
$CheckResults = $getDrivers->fetchAll(PDO::FETCH_ASSOC);
$driverOne = $CheckResults[0]['DRIVERONE'];
$driverTwo = $CheckResults[0]['DRIVERTWO'];

// echo 'TS = ' . $timeStamp;
if ($messContents != '') {
  $sqlSendMessage = "INSERT INTO EDGETSTLIB.LOAPPSTS
  (LSMSGCMPTS, LSPFLG, LSEVENT, LSEVENTTS, LSCARR, LSTRK, LSDRV1, LSDRV2, LSCOOKIE, LSMSG_ID, LSSERVERTS, LSIPADDR, LSRESPONSE, LSCMPUSR)
  VALUES
  (:currTimeOne, 'N', 'MESSAGEOUT', :currTimeTwo, :carrCode, :truckCode, :driverOne, :driverTwo, 'webportal', :theGUID, :currTimeThree, :theIP, :theMessage, :currentUser)";


$currentUser = 'PEREM';

  $sendMessage = $con->prepare($sqlSendMessage);
  $sendMessage->execute(array(":currTimeOne"=>$timeStamp, ":currTimeTwo"=>$timeStamp, ":carrCode"=>$carrierCode, ":truckCode"=>$truckCode, 
  ":driverOne"=>$driverOne, ":driverTwo"=>$driverTwo, ":theGUID"=>$theGUID, ":currTimeThree"=>$timeStamp, ":theIP"=>$userIP, ":theMessage"=>$messContents, ":currentUser"=>$currentUser ));
  echo 'Success';
} else {
  echo 'Message Box Empty';
}





?>