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
let viewingTruck = false;
let truckID;

function loadUsers(userId, isOpen) {
    //fixing issue for carriers beginning with 'A&'....
    if (document.getElementById(userId).innerHTML.substr(0, 2) === 'A&') {
        currentCarrier = document.getElementById(userId).innerHTML.substr(0, 2) + document.getElementById(userId).innerHTML.substr(6, 10)
    }
    else {
        //grab strictly the carrier code from the div's innerHTML....
        currentCarrier = document.getElementById(userId).innerHTML.substr(0, 6); //assure only the drivercode is retrieved from the innerHTML
        console.log(currentCarrier)
    }
    if (isOpen === 'open') {
        //Display the carrier code when selected
        document.getElementById('currentViewTitle').innerHTML = 'Instant Messages - ' + currentCarrier;
        messageView = document.getElementById("dispMessages");
        test = "<div class='centerEmpty'><i class='fad fa-truck-moving'></i><br><p class='emptyText'>Select a truck number<br></p></div>";
        messageView.innerHTML = test;
    }
    else {
        document.getElementById('currentViewTitle').innerHTML = '';
        messageView.innerHTML = '';
    }
    document.getElementById('loaderPieceTruck').style.display = 'block';
    // document.getElementById("dispMessages").innerHTML = '';
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
                }
                else {
                    //if the carrier is being opened for the first time, create div for the container
                    userContainer = document.createElement("DIV");
                    userContainer.id = userId + 'cont';
                    userContId = userId + 'cont';
                    userContainer.classList.add('userContClass');
                    existsObj[userId] = true;
                    existsKeys = Object.keys(existsObj);
                    //assuring that the correct group of trucks open under the correct carriers....
                    for (let i = 0; i < existsKeys.length; i++) {
                        if (existsKeys[i] < userId && existsObj[existsKeys[i]] == true) {
                            contCount++;
                        }
                    }
                    //creating and inserting trucks under the correct carrier
                    for (x = 0; x < url['hits'].length; x++) {
                        document.getElementById(userId).style = 'padding-bottom: 10px';
                        createUser = document.createElement("DIV");
                        createUser.innerHTML = url['hits'][x]['LTTRKCODE'] + " (" + url['hits'][x]['LTDSPTRK'].trim() + ")";
                        createUser.classList.add('userSelectBox');
                        truckID = 'truckID' + x;
                        createUser.id = truckID;
                        createUser.onclick = function () { switchSelectedTruck(this, userId) };
                        createUser.onclick = function () { switchSelectedTruck(this, userId) };
                        userId = parseInt(userId, 10)
                        userContainer.appendChild(createUser);
                        insertLoc = userId + 1 + contCount;
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
            }
            contCount = 0;
            userId = userId + 'cont';
            document.getElementById('loaderPieceTruck').style.display = 'none';
            //retrieve the child elements of the user container
            myTrucks = document.getElementById(userId).children;
            let enlargeCont = 100 / myTrucks.length
            let factor = 1;
            let shrinkCont = 100 / myTrucks.length
            let decfactor = 1;
            let total_height = 0;
            let open_height = 100;
            //recursively displaying users when a carrier is selected...
            if (isOpen === 'open') {
                displayAnimation(enlargeCont, factor, 0);
                //if all of the trucks have been displayed, break out of the loop.
                function displayAnimation(enlargeCont, factor, trucknum) {
                    if (trucknum <= myTrucks.length) { //break when the height reaches 100%
                        document.getElementById(userContId).style.height = (total_height + enlargeCont) + '%';
                        total_height = total_height + enlargeCont;
                        factor++; //factor by which the height is being increased....
                        myTrucks[trucknum].style.display = 'block';
                        trucknum++
                        setTimeout(function () { displayAnimation(enlargeCont, factor, trucknum); }, 100);
                    }
                }
                trucknum = 0;
            }
            else {
                userCount[userId] = 0;
                userId = userId + 'cont';
                closingAnimation(shrinkCont, decfactor, 0);
                //if all of the trucks have been closed out of, break out of the loop.
                function closingAnimation(shrinkCont, decfactor, trucknum) {
                    if (trucknum <= myTrucks.length) {
                        document.getElementById(userContId).style.height = (open_height - shrinkCont) + '%';
                        open_height = open_height - shrinkCont;
                        decfactor++; //factor by which the height is being increased....
                        myTrucks[trucknum].style.display = 'none';
                        trucknum++;
                        setTimeout(function () { closingAnimation(shrinkCont, decfactor, trucknum); }, 100);
                    }
                }
                trucknum = 0;
            }
        }
    });
}
//switching the active selected truck....
var testVar;
let updatedCarr = 0;
function switchSelectedTruck(truck, userContainer) {
    console.log('entering truck switcher')
    console.log(userContainer);
    updatedCarr = parseInt(userContainer)
    console.log(updatedCarr);
    updatedCarr = document.getElementById(updatedCarr).innerHTML;
    //set the title to whichever driver's messages you are viewing.
    document.getElementById('currentViewTitle').innerHTML = '<b>' + updatedCarr + '</b> ' + ' -' + truck.innerHTML + '</pre>';
    currentTruck = truck.innerHTML;
    currentElement = document.getElementsByClassName("boxActive");
    if (currentElement.length != 0) {
        currentElement[0].classList.remove('boxActive')
    }
    truck.classList.add('boxActive');
    console.log(updatedCarr);
    loadMessages(truck.innerHTML, 'newView', updatedCarr);
}

//loading messages
function loadMessages(truckCode, discreet, currentCarrier) {
    console.log(currentCarrier);
    console.log(truckCode);
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
            console.log(currentCarrier);
            messageView = document.getElementById("dispMessages");
            messageView.innerHTML = '';
            if (historyLength == 0) {
                test = "<div class='centerEmpty'><i class='fal fa-comment-alt-slash'></i><br><p class='emptyText'>No messages available.<br></p></div>";
                messageView.innerHTML = test;
            }
            else {
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
    //filters out the carriers as characters are entered....
    for (let i = 0; i < carrierHolder.length; i++) {
        if (!carrierHolder[i].innerHTML.includes(userInp)) {
            if (checkEmpty[carrierHolder[i].id] === false) {
                document.getElementById(carrierHolder[i].id).style.display = 'none';
                checkEmpty[carrierHolder[i].id] = true;
                carrierCount = carrierCount + 1;
                if (carrierCount === carrierHolder.length) {
                    document.getElementById('carrList').innerHTML = 'Carriers not found..'
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
                let messageView = document.getElementById('dispMessages');
                let userGuidance = "<div class='centerEmpty'><i class='fad fa-truck-moving'></i><br><p class='emptyText'>Select a truck number<br></p></div>";
                messageView.innerHTML = userGuidance;
                carrList = document.getElementById('carrList');
                carrList.appendChild(createOption);
                carrierPlaceHolder.push(createOption.innerHTML)
                carrierHolder.push(createOption);
                checkEmpty[carrierHolder[i].id] = false;
                createOption.onclick = function () {
                    //closing an opened carrier....
                    if (carrStatus[this.id] === 'open') {
                        currentCarrierId = this.id;
                        totalOpens = totalOpens + 1;
                        if (totalOpens === 1) {
                            currentCarrierId = ''; //reset string or else it will not let user reopen..
                            totalOpens = 0;
                        }
                        carrStatus[this.id] = 'closed';
                        console.log(this.id)
                        loadUsers(this.id, carrStatus[this.id], null)
                    }
                    else {
                        carrStatus[this.id] = 'open';
                        clearOld = currentCarrierId;
                        currentCarrierId = this.id;
                        console.log(carrStatus[this.id])
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
            console.log(currentCarrier);
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
let messageView = document.getElementById('dispMessages');
let userGuidance = "<div class='centerEmpty'><i class='fad fa-globe-americas'></i><br><p class='emptyText'>Select a carriers<br></p></div>";
messageView.innerHTML = userGuidance;
var theTimer = setInterval(function () {
    if (currentTruck !== '') {
        loadMessages(currentTruck, 'hidden')
    }
}, 60 * 1000); //runs every minute


document.getElementById("sendMessage").addEventListener("click", sendMessage, false)


