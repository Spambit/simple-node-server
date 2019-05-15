function createAnImageTag(src) {
    const img = new Image(200, 200)
    img.src = src
    document.body.appendChild(img)
}

window.setTimeout(_ => {
    createAnImageTag('https://i.ibb.co/jWVfcQ4/Screenshot-2019-03-27-at-1-19-24-PM.png')
},5000)