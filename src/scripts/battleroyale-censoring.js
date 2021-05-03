 //insert CSS that blur avatars
    /*let link = document.createElement("link");
    let css_url = chrome.runtime.getURL("src/br_blur.css");
    link.href = css_url;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);*/

    let ListObserver = new MutationObserver(function (mutations) {
        for (let mutation of mutations) {
            console.log(mutation.target.className)
            if (mutation.type === 'childList') {
                if(mutation.target.className==="user-nick"){
                    if (mutation.previousSibling?.data) {
                        mutation.target.innerHTML = '******';
                    }
                }

                const list_of_classes = ['player-list', 'user-grid user-grid--normal', 'player-list__player-life', 'player-list__guess-flag', 'player-list__item','wrong-guesses','br-hud','gm-style','br-game-layout__panorama'
                    ,'br-hud__timer ','life-icon life-icon--flag','popup__content','notifications-dropdown__item','circle__content']
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