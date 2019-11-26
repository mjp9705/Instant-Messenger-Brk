<?php
$con = new PDO('odbc:DRIVER={IBM I Access ODBC Driver};SYSTEM={PRIMARY-ISERIES.PRIMEINC.COM};UID={QLOASRV};PWD={8BDrOaDWO9@GM%$xy5#w};Translate={1}');
$con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$givenCarrier = $_POST['carrier'];

$sqlGrabTrucks = 'SELECT LTPRMTRK AS LTTRKCODE, LTCTMTRK AS LTDSPTRK from EDGETSTLIB.LOAPPTRK where LTPRMCAR = :carrier ORDER BY LTTRKCODE';


$getTrucks = $con->prepare($sqlGrabTrucks);
$getTrucks->execute(array(":carrier"=>$givenCarrier));
$CheckResults = $getTrucks->fetchAll(PDO::FETCH_ASSOC);
$mainThing = array("hits"=>$CheckResults);
$json = json_encode($mainThing);

header('Content-type:application/json;charset=utf-8');
header('Access-Control-Allow-Origin:*');
echo $json;

?>