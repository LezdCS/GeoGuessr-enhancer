let noteArea;
let header;
let leftpos = "70px", toppos ="0px";
let compteurScreenshots = 0;
let initY, initX, finalX, finalY;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const page = window.location;
    const url = page.pathname.toString().split("/");
    switch (request.message) {
        case 'changingWindow':
            document.body.removeEventListener('click', checkElementClicked);
            let compass = document.getElementsByClassName("compass__indicator");

            // The actual wait system is kinda bad (not stable and ugly code)
            // TODO : change wait system with a new stable one
            function wait_game() {
                if (compass.length !== undefined) {
                    try{
                        notes();
                    }catch (e){
                        setTimeout(wait_game,100);
                    }
                }else{
                    setTimeout(wait_game,100);
                }
            }

            function wait_battle_royal_prelobby(){
                let footer = document.getElementsByClassName("level-progress__footer");
                if (footer.length !== undefined) {
                    try{
                        battle_royale_lobby();
                    }catch (e){
                        setTimeout(wait_battle_royal_prelobby,100);
                    }
                }else{
                    setTimeout(wait_battle_royal_prelobby,100);
                }
            }

            function wait_battle_royal_game(){
                if (compass.length !== undefined) {
                    try{
                        battle_royale_game();
                    }catch (e){
                        setTimeout(wait_battle_royal_game,100);
                    }
                }else{
                    setTimeout(wait_battle_royal_game,100);
                }
            }

            if(url[1] === "game" || url[1]=== "challenge"){
                wait_game();

            }
            if(url[1] === "battle-royale" && url.length===2){
                wait_battle_royal_prelobby();
            }
            if(url[1] === "battle-royale" && url.length===3){
                wait_battle_royal_game();
            }
            break;

    }

    //Color changing : request from the popup
    if(request.message.startsWith("changeTheme")){
        if(url[1] === "game" || url[1]=== "challenge"){
            const themeINFOS = JSON.parse(request.message.substring(11));
            colors_changing(themeINFOS.background,themeINFOS.text_header,themeINFOS.text_body);
        }
    }
    //Textarea font size changing : request from the popup
    if(request.message.startsWith("changeFont")){
        if(url[1] === "game" || url[1]=== "challenge"){
            const fontsize = JSON.parse(request.message.substring(10));
            size_changing(fontsize);
        }
    }
})


function battle_royale_lobby(){

    //Get node (level-progress__footer) to insert a div element
    const footer = document.querySelector(".level-progress__footer");
    const divButtons = document.createElement("div");
    footer.insertBefore(divButtons, footer.children[0]);

    const blurring_photos = document.createElement("input");
    blurring_photos.type="checkbox";
    blurring_photos.id="blurring_photos";
    blurring_photos.name="blurring_photos";
    blurring_photos.value="blurring_photos";
    blurring_photos.style.marginBottom="30px"
    blurring_photos.onclick=function (){
        blurring_photos.checked ? chrome.storage.local.set({'blurring_photos': true }) : chrome.storage.local.set({'blurring_photos': false });
    }

    const blurring_photos_label = document.createElement("label");
    blurring_photos_label.htmlFor="blurring_photos"
    blurring_photos_label.style.marginRight="20px"
    blurring_photos_label.innerHTML = "Blur the avatars";

    const censor_nicknames = document.createElement("input");
    censor_nicknames.type="checkbox";
    censor_nicknames.id="censor_nicknames";
    censor_nicknames.name="censor_nicknames";
    censor_nicknames.value="censor_nicknames";
    censor_nicknames.onclick=function (){
        censor_nicknames.checked ? chrome.storage.local.set({'censor_nicknames': true }) : chrome.storage.local.set({'censor_nicknames': false });
    }

    const censor_nicknames_label = document.createElement("label");
    censor_nicknames_label.htmlFor="censor_nicknames"
    censor_nicknames_label.innerHTML = "Censoring usernames"

    chrome.storage.local.get(['blurring_photos', 'censor_nicknames'], function(items) {
        if(items.blurring_photos!==undefined){
            items.blurring_photos ? blurring_photos.checked="true" : null
        }
        if(items.censor_nicknames!==undefined) {
            items.censor_nicknames ? censor_nicknames.checked="true" : null;
        }
    });

    divButtons.appendChild(blurring_photos)
    divButtons.appendChild(blurring_photos_label)
    divButtons.appendChild(censor_nicknames)
    divButtons.appendChild(censor_nicknames_label)
}

function battle_royale_game(){

    function blurring_photos(){

        //insert CSS that blur avatars
        let link = document.createElement("link");
        let css_url = chrome.runtime.getURL("src/br_blur.css");
        link.href = css_url;
        link.type = "text/css";
        link.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    function censor_nicknames(){

        let ListObserver = new MutationObserver(function (mutations) {
            for (let mutation of mutations) {
                if (mutation.type === 'childList') {
                    if(mutation.target.className==="user-nick"){
                        if (mutation.previousSibling?.data) {
                            mutation.target.innerHTML = mutation.previousSibling.data;
                        }
                    }

                    const list_of_classes = ['player-list', 'user-grid user-grid--normal', 'player-list__player-life', 'player-list__guess-flag', 'player-list__item','wrong-guesses','br-hud','gm-style','br-game-layout__panorama'
                    ,'br-hud__timer ','life-icon life-icon--flag','popup__content']
                    if(list_of_classes.includes(mutation.target.className)){

                        let elements = document.querySelectorAll('.user-nick');
                        for(let i=0; i<elements.length; i++){
                            if(elements[i].parentNode.className!=="label-1") {
                                elements[i].innerHTML = "******"
                            }
                        }

                    }
                }
            }
        });

        let elements = document.querySelectorAll('.user-nick');
        for(let i=0; i<elements.length; i++){
            if(elements[i].parentNode.className!=="label-1"){
                elements[i].innerHTML = "******"
            }
        }

        ListObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

    }

    chrome.storage.local.get(['blurring_photos', 'censor_nicknames'], function(items) {
        if(items.blurring_photos!==undefined){
            items.blurring_photos ? blurring_photos() : null;
        }
        if(items.censor_nicknames!==undefined) {
            items.censor_nicknames ? censor_nicknames() : null;
        }
    });
}

function size_changing(size){

    const notearea = document.getElementById("textarea")
    notearea.style.fontSize=size+"px";
}

function colors_changing(backgroud, header, body){

    const game_infos = document.getElementsByClassName("game-statuses");
    for(let i = 0; i < game_infos.length; i++) {
        game_infos[i].style.backgroundColor = backgroud;
    }
    const game_headers = document.getElementsByClassName("game-status__heading");
    for(let i = 0; i < game_headers.length; i++) {
        game_headers[i].style.color = header;
    }
    const game_bodies = document.getElementsByClassName("game-status__body");
    for(let i = 0; i < game_bodies.length; i++) {
        game_bodies[i].style.color = body;
    }

    const headerNotes = document.getElementById("divGlobalNoteHeader")

    if(backgroud!=="white"){
        headerNotes.style.backgroundColor = backgroud;
        headerNotes.style.color = body;
    }else{
        headerNotes.style.backgroundColor = "var(--color-grey-80)";
        headerNotes.style.color = "white";
    }
}

function checkElementClicked(e){
    try {
        if (e.toElement.attributes[2].value === "perform-guess") {
            //reset textarea from notes to blank
            noteArea.value = "";

            //delete all screenshots from previous round
            const screenshots_list = document.querySelectorAll(".screenshots");
            for(let i=0; i<screenshots_list.length; i++){
                screenshots_list[i].remove();
            }
        }
    } catch (e) {}
}

function notes(){

    chrome.storage.local.get(['themeBackground', 'themeHeader', 'themeBody','fontSizeArea'], function(items) {
        colors_changing(items.themeBackground, items.themeHeader, items.themeBody);
        size_changing(items.fontSizeArea);
    });

    compteurScreenshots=0;

    // Make appear or disapear the notes when user click on the notes button
    function openNotes(){

        if(divGlobalNote.style.visibility==="hidden"){
            divGlobalNote.style = "position: absolute; z-index: 4;\n" +
                "visibility: visible; font-size: 15px; top:"+toppos+"; left:"+leftpos+";"
            noteArea.focus();
        }else{
            divGlobalNote.style = "position: absolute; z-index: 4;\n" +
                "visibility: hidden; font-size: 15px;"
        }
    }

    function screenshot(){

        //Get the node where insert all the following elements
        let game_layout = document.getElementsByClassName("game-layout")[0]

        let divScreenshot = document.createElement("div")
        divScreenshot.style = "z-index: 1; position: absolute;"
        game_layout.appendChild(divScreenshot)

        let darkImage = document.createElement("img")
        darkImage.src=chrome.runtime.getURL("src/images/black_background.jpg");
        darkImage.style="z-index: 1; position: absolute; opacity: 50%; cursor: crosshair; -webkit-user-drag: none;"
        divScreenshot.appendChild(darkImage)

        //Create the canvas to draw rectangle on selecting area to screen
        let canvas = document.createElement("canvas")
        canvas.id="canvasDrawSelection"
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let ctx = canvas.getContext('2d');
        divScreenshot.appendChild(canvas)

        game_layout.onmousedown = function (e){

            initX = e.clientX;
            initY = e.clientY;

            game_layout.onmousemove = function (e){

                //draw rectangle each time mouse move from initial click (onmousedown) to final position (onmouseup)
                ctx.beginPath();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
                ctx.clearRect(0,0,canvas.width, canvas.height);
                ctx.strokeRect(initX, initY, e.clientX-initX, e.clientY-initY);
                ctx.closePath();
            }

            game_layout.onmouseup = function (e){

                finalX = e.clientX;
                finalY = e.clientY;
                game_layout.onmousedown = null;
                game_layout.onmousemove = null;
                game_layout.onmouseup = null;

                divScreenshot.remove();
                generateScreenshot();
            }
        }

        function generateScreenshot(){

            let divGlobalScreen = document.createElement("div");
            divGlobalScreen.id="divGlobalScreen"+compteurScreenshots;
            divGlobalScreen.className="screenshots"
            divGlobalScreen.style = "position: absolute; z-index: 4; left: 70px; top: 0px; min-width: 140px;"
            divGlobalScreen.onclick = function () {event.stopPropagation();}

            screenTooltip.appendChild(divGlobalScreen);
            //header
            let divHeadScreen = document.createElement("div");
            divHeadScreen.id="divGlobalScreen"+compteurScreenshots+"Header"+compteurScreenshots;
            divHeadScreen.style = "padding: 7px; cursor: move; background-color: var(--color-grey-80); color: #fff; visibility: hidden;"
            divHeadScreen.onclick = function () {event.stopPropagation();}
            divGlobalScreen.appendChild(divHeadScreen);

            dragElement(document.getElementById("divGlobalScreen"+compteurScreenshots));

            //Button to close a screenshot
            let titleScreen = document.createElement("p")
            titleScreen.innerText="📸 #"+compteurScreenshots;
            titleScreen.style= "text-align: center;"
            divHeadScreen.appendChild(titleScreen);

            //Button to reduce a screenshot
            let reduceButton = document.createElement("p")
            reduceButton.innerText="Reduce | ";
            reduceButton.style= "cursor: pointer; width: fit-content; display: inline;"
            reduceButton.onclick = function (){
                if(reduceButton.innerText==="Reduce | "){
                    imageDiv.style.display="none"
                    reduceButton.innerText="Reopen | "
                }else{
                    imageDiv.style.display="block"
                    reduceButton.innerText="Reduce | "
                }
            }
            divHeadScreen.appendChild(reduceButton);

            //Button to close a screenshot
            let crossClose = document.createElement("p")
            crossClose.innerText="Close";
            crossClose.style= "cursor: pointer; width: fit-content; display: inline;"
            crossClose.onclick = function (){ divGlobalScreen.remove() }
            divHeadScreen.appendChild(crossClose);

            //increase this variable, used to manage multiple screenshots
            compteurScreenshots++;

            const imageDiv = document.createElement("div");
            imageDiv.style="resize: both;"

            //SEND request to background.js to make the screenshot
            chrome.runtime.sendMessage({message: "screenshot"}, function(response) {

                if(initX>finalX && initY>finalY){
                    initX = [finalX, finalX = initX][0];
                    initY = [finalY, finalY = initY][0];
                }

                let scale = window.devicePixelRatio;

                const CanvasImageScreen = document.createElement("canvas");
                CanvasImageScreen.style="border:1px solid #000000;"
                CanvasImageScreen.width = finalX*scale-initX*scale;
                CanvasImageScreen.height = finalY*scale-initY*scale
                let context = CanvasImageScreen.getContext('2d');
                let imageObj = new Image();

                imageObj.onload = function() {
                    // draw cropped image
                    context.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height, -initX*scale, -initY*scale, imageObj.width, imageObj.height);
                };
                imageObj.src = response.message;
                imageDiv.appendChild(CanvasImageScreen)

                //prevent the screenshot from integrating the screenshot frame created before
                divHeadScreen.style.visibility="visible"
                divGlobalScreen.appendChild(imageDiv)
            });
        }
    }

    //getting the group of left buttons
    const game_status = document.querySelector(".game-layout__controls");

    //creation the div child for the screen & notes buttons
    const divHudButtonGroup = document.createElement("div");
    game_status.insertBefore(divHudButtonGroup, game_status.children[1]);
    divHudButtonGroup.className="hud-button-group";

    ///////SCREENSHOT///////
    //creating the first child div for SCREENSHOT div
    let screenTooltip = document.createElement("div");
    divHudButtonGroup.appendChild(screenTooltip);
    screenTooltip.className="tooltip";
    screenTooltip.onclick = function(){screenshot()};
    //creating the first child div for screenTooltip div
    let screenButton = document.createElement("button");
    screenTooltip.appendChild(screenButton);
    screenButton.className="hud-button";
    screenButton.innerText="📷";
    screenButton.style.marginTop="16px";

    ///////NOTES///////
    //creating the first child div for noteCase div
    let noteTooltip = document.createElement("div");
    divHudButtonGroup.appendChild(noteTooltip);
    noteTooltip.className="tooltip";
    noteTooltip.onclick = function(){dragElement(document.getElementById("divGlobalNote")); openNotes()};
    //creating the first child div for noteTooltip div
    let noteButton = document.createElement("button");
    noteTooltip.appendChild(noteButton);
    noteButton.className="hud-button";
    noteButton.innerText="📝";
    noteButton.style.marginBottom="-20px";

    //creating the first child div for noteButton div
    let divGlobalNote = document.createElement("div");
    divGlobalNote.id="divGlobalNote";
    divGlobalNote.style = "position: absolute; z-index: 4; visibility: hidden;"
    divGlobalNote.onclick = function () {event.stopPropagation();}
    noteTooltip.appendChild(divGlobalNote);
    //header
    let divHeadNotes = document.createElement("div");
    divHeadNotes.id="divGlobalNoteHeader";
    divHeadNotes.style = "padding: 7px; cursor: move; background-color: var(--color-grey-80); color: #fff;"
    divHeadNotes.onclick = function () {event.stopPropagation();}
    divGlobalNote.appendChild(divHeadNotes);
    //title of header
    let titleNotes = document.createElement("p");
    titleNotes.style="text-align:center;"
    titleNotes.innerText="Notes"
    divHeadNotes.appendChild(titleNotes);
    //textarea
    noteArea = document.createElement("textarea");
    noteArea.className="noteArea";
    noteArea.id="textarea";
    noteArea.style = "outline: none !important; font-size: 14px;"
    noteArea.rows=6;
    noteArea.cols=33;
    noteArea.onclick = function () {event.stopPropagation();}
    divGlobalNote.appendChild(noteArea);
    
    document.body.addEventListener('click', checkElementClicked)

    header = document.getElementsByClassName("header")[0];
}


function dragElement(elmnt) {

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, prevX=0, prevY=0;
    if (document.getElementById(elmnt.id + "Header"+compteurScreenshots))
    {
        document.getElementById(elmnt.id + "Header"+compteurScreenshots).onmousedown = dragMouseDown;
    }
    else if (document.getElementById(elmnt.id + "Header"))
    {
        document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;

        // set prevX and prevY, variables used for collisions
        prevX = pos3;
        prevY = pos4;

        // call elementDrag function whenever the cursor moves:
        document.onmousemove = elementDrag;
        // call closeDragElement function when user release click:
        document.onmouseup = closeDragElement;
    }

    function elementDrag(e) {

        function move_notes_window(){
            //modify element position
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        // Set prevX and prevY, variables used for collisions
        prevX = pos3;
        prevY = pos4;

        // Modify pos1 and pos2, the ""vector"" of element movement
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        // pos3 and pos4 get new cursor position
        pos3 = e.clientX;
        pos4 = e.clientY;

        ////////////COLLISIONS////////////
        //check Left collision
        if(elmnt.getBoundingClientRect().left<=0) {
            if(e.clientX>prevX){move_notes_window();}
        }
        //check Right collision
        else if(elmnt.getBoundingClientRect().right >= document.body.offsetWidth){
            if(e.clientX<prevX){move_notes_window();}
        }
        //check Bottom collision
        else if(elmnt.getBoundingClientRect().bottom >= document.body.offsetHeight){
            if(e.clientY<prevY){move_notes_window();}
        }
        //check Top collision
        else if(elmnt.getBoundingClientRect().top <= header.offsetHeight){
            if(e.clientY>prevY){move_notes_window();}
        }
        else{
            // if not in situation of collision, just call function to move
            move_notes_window();
        }
    }

    function closeDragElement() {
        // unbind when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}