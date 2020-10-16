let noteArea;
let header;
let leftpos = "70px", toppos ="0px"

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const page = window.location;
    const url = page.pathname.toString().split("/");
    switch (request.message) {
        case 'changingWindow':
            document.body.removeEventListener('click', checkElementClicked);
            let compass = document.getElementsByClassName("compass__indicator");

            function wait() {
                if (compass.length !== undefined) {
                    try{
                        notes();
                    }catch (e){
                        setTimeout(wait,100);
                    }
                }else{
                    setTimeout(wait,100);
                }
            }
            if(url[1] === "game" || url[1]=== "challenge"){
                wait();
            }
            break;

    }
    if(request.message.startsWith("changeTheme")){
        if(url[1] === "game" || url[1]=== "challenge"){
            const themeINFOS = JSON.parse(request.message.substring(11));
            colors_changing(themeINFOS.background,themeINFOS.text_header,themeINFOS.text_body);
        }
    }
    if(request.message.startsWith("changeFont")){
        if(url[1] === "game" || url[1]=== "challenge"){
            const fontsize = JSON.parse(request.message.substring(10));
            size_changing(fontsize)
        }
    }
})

function game_page_ready(){
    const left_panel = document.getElementsByClassName("game-layout__controls");
    const game_infos = document.getElementsByClassName("game-status__body");
    if (left_panel.length === 0 && game_infos.length === 0){
        setTimeout(game_page_ready,100);
    }else{
        notes();
    }
}

function size_changing(size){
    console.log(size)
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

    const headerNotes = document.getElementById("divGlobalNoteheader")

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
            noteArea.value = "";
        }
    } catch (e) {}
}

function notes(){
    chrome.storage.local.get(['themeBackground', 'themeHeader', 'themeBody','fontSizeArea'], function(items) {
        colors_changing(items.themeBackground, items.themeHeader, items.themeBody);
        size_changing(items.fontSizeArea);
    });

    // make appear or disapear the notes when click on the notes button
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

    //getting the group of left buttons
    const game_status = document.querySelector(".game-layout__controls");

    //creation the div child for the notes
    const noteCase = document.createElement("div");
    game_status.insertBefore(noteCase, game_status.children[1]);
    noteCase.className="hud-button-group";

    //creating the first child div for noteCase div
    const noteTooltip = document.createElement("div");
    noteCase.appendChild(noteTooltip);
    noteTooltip.className="tooltip";
    noteTooltip.onclick = function(){dragElement(document.getElementById("divGlobalNote")); openNotes()};

    //creating the first child div for noteTooltip div
    const noteButton = document.createElement("button");
    noteTooltip.appendChild(noteButton);
    noteButton.className="hud-button";
    noteButton.innerText="📝";
    noteButton.style.marginTop="16px";
    noteButton.style.marginBottom="-20px";


    //creating the first child div for noteButton div
    var divGlobalNote = document.createElement("div");
    divGlobalNote.id="divGlobalNote";
    divGlobalNote.style = "position: absolute; z-index: 4; visibility: hidden;"
    divGlobalNote.onclick = function () {event.stopPropagation();}
    noteTooltip.appendChild(divGlobalNote);

    //header
    var divHeadNotes = document.createElement("div");
    divHeadNotes.id="divGlobalNoteheader";
    divHeadNotes.style = "padding: 7px; cursor: move; background-color: var(--color-grey-80); color: #fff;"
    divHeadNotes.onclick = function () {event.stopPropagation();}
    divGlobalNote.appendChild(divHeadNotes);

    //title of header
    var titleNotes = document.createElement("p");
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


// function to drag the textarea
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, prevX=0, prevY=0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        prevX = pos3;
        pos4 = e.clientY;
        prevY = pos4;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {

        function move_notes_window(){
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        prevX = pos3;
        prevY = pos4;
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:

        //collisions
        if(elmnt.getBoundingClientRect().left<=0) { //check left colide
            if(e.clientX>prevX){move_notes_window();}
        }else if(elmnt.getBoundingClientRect().right >= document.body.offsetWidth){ //check right colide
            if(e.clientX<prevX){move_notes_window();}
        }else if(elmnt.getBoundingClientRect().bottom >= document.body.offsetHeight){ //check bottom colide
            if(e.clientY<prevY){move_notes_window();}
        }else if(elmnt.getBoundingClientRect().top <= header.offsetHeight){ //check top colide
            if(e.clientY>prevY){move_notes_window();}
        }
        //if no colide then :
        else{move_notes_window();}
        }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}