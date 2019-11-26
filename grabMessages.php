<?php

$con = new PDO('odbc:DRIVER={IBM I Access ODBC Driver};SYSTEM={PRIMARY-ISERIES.PRIMEINC.COM};UID={QLOASRV};PWD={8BDrOaDWO9@GM%$xy5#w};Translate={1}');
$con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$theTruck = substr($_POST['theTruck'], 0, 6);
$theCarrier = $_POST['carrier'];
$sqlGrabMessage = "select LSMSGCMPTS as COMPTIME, trim(LSEVENT) as MSGEVENT, trim(LSPFLG) AS MSGFLAG, trim(LSCMPUSR) AS MSGSENDER, trim(LSRESPONSE) AS MSGCONTENT from edgetstlib.loappsts where (LSEVENT = 'MESSAGEIN' or LSEVENT = 'MESSAGEOUT') and LSCARR = :theCarrier and LSTRK = :theTruck";

$getMessages = $con->prepare($sqlGrabMessage);
$getMessages->execute(array("theCarrier"=>$theCarrier, ":theTruck"=>$theTruck));
$CheckResults = $getMessages->fetchAll(PDO::FETCH_ASSOC);
$mainThing = array("hits"=>$CheckResults);
$json = json_encode($mainThing);

header('Content-type:application/json;charset=utf-8');
header('Access-Control-Allow-Origin:*');
echo $json;

?>