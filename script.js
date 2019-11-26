//declaring global vars
let messageHistory = {}
let startTruckID = 0;
let currentTruck = '';
let openCarrier = false; //monitoring whether or not a carrier is open...
let currentCarrierId = '';
let totalOpens = 0; // counting the total amount of times opened to keep track consistent
let carrStatus = {};
let currentCarrier = '';
let userCount = {};
let preceedingUsers = 0;
let idContainer = [];
let existsObj = {}; //whether or not a carrier currently exists (helps prevent appending divs mult times)
let existsKeys = [];
let contCount = 0;
let myTrucks;
let emptyCount = 0;

function loadUsers(userId, isOpen) {
    //fixing issue for carriers beginning with 'A&'....
    if (document.getElementById(userId).innerHTML.substr(0, 2) === 'A&') {
        currentCarrier = document.getElementById(userId).innerHTML.substr(0, 2) + document.getElementById(userId).innerHTML.substr(6, 10)
    }
    else {
        //grab strictly the carrier code from the div's innerHTML....
        currentCarrier = document.getElementById(userId).innerHTML.substr(0, 6); //assure only the drivercode is retrieved from the innerHTML
        console.log(currentCarrier);
    }
    if (isOpen === 'open') {
        //Display the carrier code when selected
        document.getElementById('currentViewTitle').innerHTML = 'Instant Messages - ' + currentCarrier;
    }
    else {
        document.getElementById('currentViewTitle').innerHTML = '';
    }
    document.getElementById('loaderPieceTruck').style.display = 'block';
    document.getElementById("dispMessages").innerHTML = '';
    $.ajax({
        type: "POST",
        data: { "carrier": currentCarrier },
        async: true,
        dataType: 'json',
        url: "grabMsgTrucks.php",
        success: function (url) {
            if (isOpen === 'open') { //if the user is opening a carrier
                if (existsObj[userId] === true) {
                    //if the div is already created for the carrier, do not create a new div...
                    userContId = userId + 'cont';
                    userContainer = document.getElementById(userContId);
                    console.log(userContId);
                }
                else {
                    //if the carrier is being opened for the first time, create div for the container
                    userContainer = document.createElement("DIV");
                    userContainer.id = userId + 'cont';
                    userContId = userId + 'cont';
                    userContainer.classList.add('userContClass');
                    console.log(userContId);
                    existsObj[userId] = true;
                }
                // if the carrier has already been opened once and it is above the current carrier
                //take into account this div when inserting the new container.... 
                existsKeys = Object.keys(existsObj);
                console.log('contcount ' + contCount)
                for (let i = 0; i < existsKeys.length; i++) {
                    if (existsKeys[i] < userId && existsObj[existsKeys[i]] == true) {
                        console.log('incrementing contcount')
                        contCount++;
                        console.log(contCount)
                    }
                }
                //taking into account carries w/no trucks that
                contCount = contCount - emptyCount;
                if (url['hits'].length === 0) {
                    userId = parseInt(userId, 10);
                    console.log(userId + 1 + contCount)
                    emptyCount++;
                }
                else {
                    //create the divs for the trucks of a specific carrier...
                    for (x = 0; x < url['hits'].length; x++) {
                        document.getElementById(userId).style = 'padding-bottom: 10px';
                        createUser = document.createElement("DIV");
                        createUser.innerHTML = url['hits'][x]['LTTRKCODE'] + " (" + url['hits'][x]['LTDSPTRK'] + ")";
                        createUser.classList.add('userSelectBox');
                        createUser.onclick = function () { switchSelectedTruck(this) };
                        createUser.onclick = function () { switchSelectedTruck(this) };
                        userId = parseInt(userId, 10)
                        userContainer.appendChild(createUser);
                        insertLoc = userId + 1 + contCount;
                        console.log('insert loc = ' + insertLoc);
                        console.log('user id = ' + userId)
                        console.log('user id = ' + contCount)
                        carrList.insertBefore(userContainer, carrList.children[insertLoc]);
                        preceedingUsers = 0;
                        if (userCount[userId] >= 1) {
                            userCount[userId]++;
                        }
                        else {
                            userCount[userId] = 1;
                        }
                    }
                }
                console.log(userContId)
                console.log('test')
            }
            else{
                userCount[userId] = 0;
                userId = userId + 'cont';
            }
            contCount = 0;
            document.getElementById('loaderPieceTruck').style.display = 'none';
            myTrucks = document.getElementById(userContId).children;
            let enlargeCont = 100 / myTrucks.length
            console.log(myTrucks.length)
            let factor = 1;
            let shrinkCont = 100 / myTrucks.length
            let decfactor = 1;
            //recursively displaying users when a carrier is selected...
            console.log(isOpen)
            if (isOpen === 'open') {
                console.log('opening')
                displayAnimation(enlargeCont, factor, 0);
                function displayAnimation(enlargeCont, factor, trucknum) {
                    console.log(enlargeCont, factor, trucknum)
                    if (enlargeCont <= 100) { //break when the height reaches 100%
                        document.getElementById(userContId).style.height = (enlargeCont * factor) + '%';
                        factor++; //factor by which the height is being increased....
                        enlargeCont = enlargeCont * factor;
                        myTrucks[trucknum].style.display = 'block';
                        trucknum++
                        setTimeout(function () { displayAnimation(enlargeCont, factor, trucknum); }, 100);
                    }
                }
            }
            else{
                console.log('closing')
                closingAnimation(shrinkCont, decfactor, 0);
                function closingAnimation(shrinkCont, decfactor, trucknum){
                    console.log(shrinkCont, decfactor, trucknum)
                    if(shrinkCont <= 100){
                        document.getElementById(userContId).style.height = (1 - shrinkCont * factor) + '%';
                        decfactor++; //factor by which the height is being increased....
                        shrinkCont = shrinkCont * decfactor;
                        myTrucks[trucknum].style.display = 'none';
                        trucknum++
                        setTimeout(function () { closingAnimation(shrinkCont, decfactor, trucknum); }, 100);
                    }
                }
                userCount[userId] = 0;
                userId = userId + 'cont';
                // document.getElementById(userId).style = 'padding-bottom: 0px', 'background-color: white';
                // document.getElementById(userId).innerHTML = document.getElementById(userId).innerHTML.substr(0, 6);
            }
        }
    });
}
//switching the active selected truck....
function switchSelectedTruck(truck) {
    document.getElementById('currentViewTitle').innerHTML = truck.innerHTML;
    currentTruck = truck.innerHTML;
    currentElement = document.getElementsByClassName("boxActive");
    if (currentElement.length != 0) {
        currentElement[0].classList.remove('boxActive')
    }
    truck.classList.add('boxActive');
    loadMessages(truck.innerHTML, 'newView');
}

//loading messages
function loadMessages(truckCode, discreet) {
    if (discreet == 'hidden') {
        messageView = document.getElementById("dispMessages");
    } else {
        messLoad = '<div class="centerLoading"><div class="lds-facebook-main"><div></div><div></div><div></div></div></div>';
        messageView = document.getElementById("dispMessages");
        messageView.innerHTML = messLoad;
    }
    $.ajax({
        type: "POST",
        data: { "carrier": currentCarrier, "theTruck": truckCode },
        async: true,
        dataType: 'json',
        url: "grabMessages.php",
        success: function (url) {

            historyLength = url['hits'].length;
            messageView = document.getElementById("dispMessages");
            messageView.innerHTML = '';

            if (historyLength == 0) {
                test = "<div class='centerEmpty'><i class='fa fa-ban iconStyle'></i><br><p class='emptyText'>Message Box<br><b>Empty</b></p></div>";
                messageView.innerHTML = test;
            } else {
                for (x = 0; x < historyLength; x++) {
                    createMessage = document.createElement("DIV");
                    messageStamp = document.createElement("DIV");
                    if (url['hits'][x]['MSGSENDER'] == '') {
                        url['hits'][x]['MSGSENDER'] = 'System';
                    }
                    messageStamp.innerHTML = url['hits'][x]['COMPTIME'] + ' - ' + url['hits'][x]['MSGSENDER'];
                    if (url['hits'][x]['MSGFLAG'] == 'N') {
                        messageStamp.innerHTML += ' - ' + '<b style="color: #ffa0a0">Unprocessed</b>';
                    }
                    messageStamp.classList.add("messageHead");
                    createMessage.appendChild(messageStamp);

                    createMessage.innerHTML += url['hits'][x]['MSGCONTENT'];

                    if (url['hits'][x]['MSGEVENT'] == 'MESSAGEOUT') {
                        createMessage.classList.add('fromMe');
                    } else {
                        createMessage.classList.add('fromElse');
                    }
                    messageView.appendChild(createMessage);
                }
            }
        }
    });
}
let carrierPlaceHolder = [];
let checkEmpty = {};
let usersArray = [];
let openUsers;

function searchCleanup(openUsers) {
    for (let i = 0; i < openUsers.length; i++) {
        openUsers[i].style.display = 'none';
    }
    return openUsers;
}
//filters out carriers when user searches....
function checkInput() {
    let openUsers = document.getElementsByClassName('userSelectBox');
    //removing users from other carriers when searching...
    openUsers = searchCleanup(openUsers)
    let carrierCount = 0;

    let userInp = document.querySelector('.inputField').value
    userInp = userInp.toUpperCase();
    console.log(userInp);
    //filters out the carriers as characters are entered....
    for (let i = 0; i < carrierHolder.length; i++) {
        if (!carrierHolder[i].innerHTML.includes(userInp)) {
            if (checkEmpty[carrierHolder[i].id] === false) {
                document.getElementById(carrierHolder[i].id).style.display = 'none';
                checkEmpty[carrierHolder[i].id] = true;
                carrierCount = carrierCount + 1;
                if (carrierCount === carrierHolder.length) {
                    document.getElementById('carrList').innerHTML = 'Carrier not found..'
                }
            }
        }
        else if (checkEmpty[carrierHolder[i].id] === true && carrierPlaceHolder[i].includes(userInp)) {
            document.getElementById(carrierHolder[i].id).style.display = 'block';
            carrierCount = carrierCount - 1;
            checkEmpty[carrierHolder[i].id] = false;
        }
        else {
            continue;
        }
    }
}

let carrierHolder = [];
function loadCarriers() {
    $.ajax({
        type: "GET",
        async: false,
        dataType: 'json',
        url: "grabCarriers.php",
        success: function (url) {
            //creating and loading carriers whilst monitoring the open/close status of the carriers
            for (i = 0; i < url['hits'].length; i++) {
                createOption = document.createElement('li');
                createOption.innerHTML = url['hits'][i]['LBCARR'];
                createOption.classList.add('carrierSelectBox')
                createOption.setAttribute("id", i);

                carrList = document.getElementById('carrList');
                carrList.appendChild(createOption);

                carrierPlaceHolder.push(createOption.innerHTML)
                carrierHolder.push(createOption);
                checkEmpty[carrierHolder[i].id] = false;

                createOption.onclick = function () {
                    //closing an opened carrier....
                    if (carrStatus[this.id] === 'open') {
                        currentCarrierId = this.id
                        isIdSame = true;
                        totalOpens = totalOpens + 1;
                        if (totalOpens === 1) {
                            currentCarrierId = ''; //reset string or else it will not let user reopen..
                            totalOpens = 0;
                        }
                        carrStatus[this.id] = 'closed';
                        loadUsers(this.id, carrStatus[this.id], null)
                    }
                    else {
                        carrStatus[this.id] = 'open';
                        clearOld = currentCarrierId;
                        currentCarrierId = this.id;
                        isIdSame = false;
                        loadUsers(this.id, carrStatus[this.id], clearOld)
                    }

                }
            }
        }
    });
}

//message sending (Brad)
function sendMessage() {
    document.getElementById('sendMessage').disabled = true;
    messageText = document.getElementById("newMessText").value;
    var data = {
        messageContent: messageText,
        messageCarrier: currentCarrier,
        messageTruck: currentTruck
    }
    fetch('sendMessage.php', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data),
    }).then(function (response) {
        if (response.status == '200') {
            loadMessages(currentTruck, 'messSent');
            document.getElementById("newMessText").value = '';

            document.getElementById('sendMessage').disabled = false;
        } else {
            alert('There seems to have been an issue')

            document.getElementById('sendMessage').disabled = false;
        }
    })
}

loadCarriers();
var theTimer = setInterval(function () { loadMessages(currentTruck, 'hidden') }, 60 * 1000); //runs every minute
document.getElementById("sendMessage").addEventListener("click", sendMessage, false)


