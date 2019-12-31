<?php
$con = new PDO('odbc:DRIVER={IBM I Access ODBC Driver};SYSTEM={PRIMARY-ISERIES.PRIMEINC.COM};UID={QLOASRV};PWD={8BDrOaDWO9@GM%$xy5#w};Translate={1}');
$con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


$givenCarrier = $_POST['carrier'];
$givenTruck = $_POST['truck'];

$sqlUpdateSts = "UPDATE edgetstlib.loappsts
set LSPFLG = 'Y' 
WHERE LSTRK = :theTruck and LSEVENT = 'MESSAGEIN' and LSCARR = :theCarrier";

$updateStatus = $con->prepare($sqlUpdateSts);
$updateStatus->execute(array(":theTruck"=>$givenTruck, ":theCarrier"=>$givenCarrier));


