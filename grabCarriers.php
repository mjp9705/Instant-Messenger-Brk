<?php
$con = new PDO('odbc:DRIVER={IBM I Access ODBC Driver};SYSTEM={PRIMARY-ISERIES.PRIMEINC.COM};UID={QLOASRV};PWD={8BDrOaDWO9@GM%$xy5#w};Translate={1}');
$con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$sqlGrabCarriers = "SELECT LBCARR from EDGETSTLIB.LOAPPBRK where LBCARR = 'RUMEN' or LBCARR = 'MMMBBQ' or LBCARR = 'IMGLLC'
or LBCARR = 'A&DFRE'";

$sqlGrabCarriers = "select distinct(LTPRMCAR) as LBCARR from edgetstlib.loapptrk";

$getCarriers = $con->prepare($sqlGrabCarriers);
$getCarriers->execute();
$CheckResults = $getCarriers->fetchAll(PDO::FETCH_ASSOC);
$mainThing = array("hits"=>$CheckResults);
$json = json_encode($mainThing);

header('Content-type:application/json;charset=utf-8');
header('Access-Control-Allow-Origin:*');
echo $json;

?>