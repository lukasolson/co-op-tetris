var TetrisGame = require("./tetris-game"),
	app = require("http").createServer(),
	io = require("socket.io").listen(app);

app.listen(1111);

var tetrisGame = null;

function newGame() {
	console.log("New Game");
	
	tetrisGame = new TetrisGame(20, 10, {
		levelFallIntervalMultiplier: 0.75,
		levelLinesCount: 10
	});
	
	tetrisGame.on("change", function() {
		io.sockets.json.send(tetrisGame.toJSON());
	});
	
	tetrisGame.on("game-over", function() {
		io.sockets.emit("game-over");
		newGame();
	});
}

newGame();

io.sockets.on("connection", function(socket) {
	console.log("New player");
	
	var localTetrisGame = tetrisGame;
	localTetrisGame.addTetronimo();
	var index = localTetrisGame.tetronimoes.length - 1;
	
	socket.emit("init", tetrisGame.toJSON());
	socket.on("message", function(message) {
		if (message.indexOf("_") < 0) { // Don't allow access to private methods
			localTetrisGame[message](index);
		}
	});
});