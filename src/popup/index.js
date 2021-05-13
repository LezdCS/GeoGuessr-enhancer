import jsonthemes from './json/themes.js';

function changeTheme(e) {
    chrome.storage.sync.set({'themeBackground': e.background,
        'themeHeader': e.text_header, 'themeBody': e.text_body}, function() {
        console.log('Settings saved');
    });

    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {
            message: 'changeTheme'+JSON.stringify(e)
        });
    })
}

function changeFontSize() {
    chrome.storage.sync.set({'fontSizeArea': inputFontSize.value }, function() {
        console.log('Settings saved');
    });

    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {
            message: 'changeFont'+inputFontSize.value
        });
    })
}

function changeAccent(color) {
    chrome.storage.sync.set({'accentColor': color }, function() {
        console.log('Settings saved');
    });
    document.documentElement.style
        .setProperty('--color-accent', color);
}

function create_themes(list, perso) {
    console.log(list)
    list.forEach(x => {
        const divTheme = document.createElement("div")
        divTheme.style.display="inline-block"
        divTheme.style.marginBottom="10px"

        const themeOption = document.createElement("button");
        themeOption.className="buttonTheme"
        themeOption.style.backgroundColor=x.background
        themeOption.value=x.id;
        themeOption.title=x.name;
        themeOption.onclick=function(){event.preventDefault(); changeTheme(x);}
        divTheme.appendChild(themeOption)

        if(perso){
            const themeOption = document.createElement("img");
            themeOption.id="crossDelete"
            themeOption.src="images/redcross.png"
            themeOption.onclick=function(){
                //call function to delete the specific theme
                delete_theme(x)
            }
            divTheme.appendChild(themeOption)
        }
        themes.appendChild(divTheme)
    })
}

function delete_theme(theme){
    chrome.storage.sync.get(['personalisedThemes'], function(items) {
        let perso_themes = JSON.parse(items.personalisedThemes)
        console.log(perso_themes.length)
        if(perso_themes.length===1){
            chrome.storage.sync.remove(["personalisedThemes"],function(){})
        }else{
            console.log("before : "+ JSON.stringify(perso_themes))

            perso_themes.forEach(function(x, index) {
                if(x.id===theme.id){
                    perso_themes.splice(index, 1);
                    return false;
                }
            })

            console.log("after : "+ JSON.stringify(perso_themes))
            chrome.storage.sync.set({'personalisedThemes': JSON.stringify(perso_themes) }, function() {});
        }
        location.reload();
        return false;
    });
}


const accent_colors = {"Blue":"#3DB4F2","Red":"#E85D75","Blue dim":"#8DB2DB","Peach":"#FA7A7A","Orange":"#F79A63",
                        "Yellow":"#F7BF63","Green":"#7BD555","Purple":"#9256F3","Pink":"#FC9DD6"}

const themes = document.getElementById("themes");

//displaying the themes
create_themes(jsonthemes.themes, false)

chrome.storage.sync.get(['personalisedThemes'], function(items) {
    if(items.personalisedThemes!==undefined) {
        let perso_themes = items.personalisedThemes
        console.log(perso_themes)
        create_themes(JSON.parse(perso_themes),true)
    }

    //creating the "+" button to add themes
    const add_them_button = document.createElement("a")
    add_them_button.textContent="+";
    add_them_button.href="add_theme.html"
    add_them_button.id="btnAddTheme";

    console.log(themes.childElementCount-1)
    if((themes.childElementCount-1)%5===0){
        console.log(themes.childElementCount)
        add_them_button.style.position="relative"
    }
    themes.appendChild(add_them_button)
});

//getting the fontSizeArea and the accentColor
try{
    var inputFontSize = document.getElementById("fontSizeArea")
    inputFontSize.onchange=changeFontSize;

    chrome.storage.sync.get(['fontSizeArea','accentColor'], function(items) {
        if(items.accentColor!==undefined) {
            changeAccent(items.accentColor)
        }
        if(items.fontSizeArea===undefined){
            inputFontSize.value = 15;
        }else{
            inputFontSize.value = items.fontSizeArea
        }
    });
}catch (e) {}


//creating the accents colors buttons
const accentsColorsDiv = document.getElementById("accentsColors");

Object.entries(accent_colors).forEach(([key, value]) => {
    const accent = document.createElement("button");
    accent.className="buttonAccent"
    accent.style.backgroundColor=value
    accent.title=key;
    accent.onclick=function(){
        event.preventDefault();
        changeAccent(value);
    }
    accentsColorsDiv.appendChild(accent)
});


let blurring_photos = document.getElementById("blurring_photos")
blurring_photos.onclick=function (){
    if(blurring_photos.checked){
        chrome.storage.sync.set({'blurring_photos': true }, function() {});
    }else{
        chrome.storage.sync.set({'blurring_photos': false }, function() {});
    }
}

let censor_nicknames = document.getElementById("censor_nicknames")
censor_nicknames.onclick=function (){
    if(censor_nicknames.checked){
        chrome.storage.sync.set({'censor_nicknames': true }, function() {});
    }else{
        chrome.storage.sync.set({'censor_nicknames': false }, function() {});
    }
}

chrome.storage.sync.get(['blurring_photos', 'censor_nicknames'], function(items) {
    if(items.blurring_photos!==undefined){
        if(items.blurring_photos){
            blurring_photos.checked="true";
        }
    }
    if(items.censor_nicknames!==undefined) {
        if(items.censor_nicknames){
            censor_nicknames.checked="true";
        }
    }
});
