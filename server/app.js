var path = require("path");
var fs = require("fs");

var TetrisGame = require("./tetris-game"),
	app = require("http").createServer(
		(req, res) => {
			const url = req.url === '/' ? '/index.html' : req.url;
			const filePath = path.join(__dirname, '../client', url);
			const ext = path.extname(filePath);
			fs.readFile(filePath, (err, content) => {
				if (err) {
					res.writeHead(404);
					res.end(`File not found: ${req.url}`);
				} else {
					const contentType = {
						'.html': 'text/html',
						'.css': 'text/css',
						'.js': 'text/javascript',
						'.png': 'image/png'
					}[ext] || 'text/plain';
					res.writeHead(200, { 'Content-Type': contentType });
					res.end(content);
				}
			});
		}),
	io = require("socket.io")(app);

app.listen(1111);

var tetrisGame = null;

function newGame() {
	console.log("New Game");
	
	tetrisGame = new TetrisGame(20, 10, {
		levelFallIntervalMultiplier: 0.75,
		levelLinesCount: 10
	});
	
	tetrisGame.on("change:data", function () {
		io.sockets.json.emit("change:data", tetrisGame.toJSON());
	});
	
	tetrisGame.on("change:tetromino", function (id) {
		io.sockets.json.emit("change:tetromino", {id: id, tetromino: tetrisGame._tetrominoes[id]});
	});
	
	tetrisGame.on("game-over", function () {
		io.sockets.emit("game-over");
		newGame();
	});
}

newGame();

io.sockets.on("connection", function (socket) {
	console.log("Player connected: " + socket.id);

	tetrisGame.addTetromino(socket.id);
	socket.emit("init", {id: socket.id, tetrisGame: tetrisGame.toJSON()});
	
	var local = tetrisGame;
	socket.on("message", function (message) {
		if (message.indexOf("_") < 0) { // Don't allow access to private methods
			local[message](socket.id);
		}
	});
	
	socket.on("disconnect", function () {
		console.log("Player disconnected: " + socket.id);
		local.removeTetromino(socket.id);
	});
});