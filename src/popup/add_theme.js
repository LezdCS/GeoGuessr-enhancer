function addTheme() {
    let newThemesString;
    let themesJSON;
    let newTheme = {};
    const form = document.getElementById("formAddTheme");

    chrome.storage.sync.get(['personalisedThemes'], function(items) {
        console.log(items.personalisedThemes)
        if(items.personalisedThemes!==undefined) {
            themesJSON = items.personalisedThemes
            console.log("Themes already saved : "+themesJSON)
            let length = JSON.parse(themesJSON).length
            let previous_id = JSON.parse(themesJSON)[length-1].id

            newTheme["id"] = previous_id+1
        }else{
            newTheme["id"] = 3
        }

        //going through the elements in the form and put the id and the value into json format
        for(let i=0; i<form.elements.length; i++){
            newTheme[form.elements[i].id] = form.elements[i].value;
        }

        const jsonString = JSON.stringify(newTheme);
        console.log("New theme created : "+jsonString)

        themesJSON!==undefined ? newThemesString = '['+themesJSON.substring(1,themesJSON.length-1)+','+jsonString+']' : newThemesString = '['+jsonString+']';
        console.log("Final themes string : "+newThemesString)

        chrome.storage.sync.set({'personalisedThemes': newThemesString }, function() {});

        //redirect to main page
        window.location="popup.html"
    });
}

const submitBtn = document.getElementById("buttonSubmitForm")
submitBtn.onclick=function () {
    event.preventDefault();
    addTheme();
}