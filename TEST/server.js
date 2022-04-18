var currentph = 1;

function addCard() {
    var topText = document.createElement("div");
    topText.setAttribute("class", "text-top");
    topText.appendChild(document.createTextNode("+4"));

    var middleText = document.createElement("div");
    middleText.setAttribute("class", "text-middle");
    middleText.appendChild(document.createTextNode("+4"));

    var li = document.createElement("li");
    li.appendChild(topText);
    li.appendChild(middleText);
    li.setAttribute("class", "card");

    var ul = document.getElementById("ph" + currentph);
    if(ul.clientWidth >= screen.width*0.8) {
        currentph++;
        var newLine = document.createElement("ul");
        newLine.setAttribute("class", "card-container");
        newLine.setAttribute("id", "ph" + currentph);
        newLine.setAttribute("style", "transform: translate(-50%, 20%);");
        newLine.appendChild(li);
        ul.appendChild(newLine);
    }else{ 
        ul.appendChild(li);
    }
}

function removeCard() {
    var ul = document.getElementById("ph" + currentph);
    var li = ul.lastChild;
    ul.removeChild(li);
    if(ul.lastChild == null) {
        currentph--;
        ul = document.getElementById("ph" + currentph);
        ul.removeChild(ul.lastChild);
    }
}


//call function1() when click me button is clicked
document.getElementById("add").addEventListener("click", addCard);
document.getElementById("remove").addEventListener("click", removeCard);