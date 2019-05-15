function createAnImageTag(src) {
    const img = new Image(200, 200)
    img.src = src
    document.body.appendChild(img)
}

function cookietest() {
    fetch('/cookies', {
        credentials: 'include',
        mode: 'no-cors'
    })
        .then(function (response) {
            alert(`Set cookie through this fetch call: ${JSON.stringify(document.cookie)}`);
        });
}

setTimeout(() => {
    let btn = document.createElement('button');
    btn.innerHTML = 'Fetch cookies';
    btn.onclick = function (evt) {
        cookietest();
        alert(`Existing cookie : ${JSON.stringify(document.cookie)}`)
    }
    //alert(`Existing cookie : ${JSON.stringify(document.cookie)}`)
    document.body.appendChild(btn);
}, 1000);

setTimeout(() => {
    let btn = document.createElement('button');
    btn.innerHTML = 'Set Cookie';
    btn.onclick = function (evt) {
        document.cookie = "username=John Doe; expires=Thu, 18 Dec 2013 12:00:00 UTC; an=ui;";
        alert(`Existing cookie : ${JSON.stringify(document.cookie)}`)
    }
    document.body.appendChild(btn);
}, 1000);

setTimeout(() => {
    let btn = document.createElement('button');
    btn.innerHTML = 'Get Cookie';
    btn.onclick = function (evt) {
        alert(`Existing cookie : ${JSON.stringify(document.cookie)}`)
    }
    document.body.appendChild(btn);
}, 1000);

setTimeout(() => {
    let btn = document.createElement('button');
    btn.innerHTML = 'xhr';
    btn.onclick = function (evt) {
        // var xhttp = new XMLHttpRequest();
        // xhttp.mode = "no-cors";
        // xhttp.onreadystatechange = function () {
        //     if (this.readyState == 4 && this.status == 200) {
        //         // Typical action to be performed when the document is ready:
        //         alert('loaded xhr');
        //     }
        // };
        // xhttp.open("GET", "https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send", true);
        // xhttp.send();
        fetch('https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send', {
            credentials: 'include',
            mode: 'no-cors'
        }).then(function (response) {
                alert(response);
            });
    }
    document.body.appendChild(btn);
}, 1000);