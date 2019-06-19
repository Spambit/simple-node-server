function createAnImageTag(src) {
    const img = new Image(200, 200)
    img.src = src
    document.body.appendChild(img)
}

function cookietest() {
    fetch('/cookies', {
        credentials: 'include'
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
        document.cookie = "username=John Doe";
        document.cookie = "username2=John Doe2";
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