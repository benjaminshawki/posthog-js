const path = require('path')
const express = require('express')
const app = express()
const port = 3001

app.use('/static', express.static(__dirname + '/../../dist'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.post('/flags', function (req, res) {
    res.json({
        editorParams: {},
        featureFlags: ['session-recording-player'],
        isAuthenticated: false,
        sessionRecording: {
            endpoint: '/ses/',
        },
        supportedCompression: ['gzip', 'lz64'],
    })
})
