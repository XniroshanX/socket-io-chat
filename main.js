var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');

app.use(bodyParser.json());

var users = {};

/* ==============================
 Load home page
 ================================ */
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/templates/login.html');
});

/* ==============================
 Send message
 ================================ */
app.get('/send/message', function (req, res) {
    /*
     * Define required variables
     */
    var username = req.query.username;
    var message = req.query.message;
    var socketId = users[username].socket;
    /*
     * Send message to specific socket id
     */
    io.to(socketId).emit("receive_message", {message: message});
    res.send(req.query);
});

/* ==============================
 Initialize socket connection
 ================================ */
io.on('connection', function (socket) {
    /*
     *  Register user
     */
    socket.on('online', function (data) {
        users[data.username] = {
            username: data.username,
            socket: socket.id
        };
        /*
         * Emit user list
         */
        console.log("emitting...");
        io.emit("users", users);
    });

    /*
     * Send message
     */
    socket.on('send_message', function (data) {
        var username = data.username;
        console.log(data);
        if (username == "all") {
            io.emit("receive_message", {message: data.message});
        } else {
            var socketId = users[data.username].socket;
            io.to(socketId).emit("receive_message", {message: data.message});
        }
    });

});


http.listen(port, function () {
    console.log('listening on *:' + port);
});