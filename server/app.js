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
	
	tetrisGame.on("change:data", function() {
		io.sockets.json.emit("change:data", tetrisGame.toJSON());
	});
	
	tetrisGame.on("change:tetronimo", function(index) {
		io.sockets.json.emit("change:tetronimo", {index: index, tetronimo: tetrisGame.tetronimoes[index]});
	});
	
	tetrisGame.on("game-over", function() {
		io.sockets.emit("game-over");
		newGame();
	});
}

newGame();

io.sockets.on("connection", function(socket) {
	console.log("New player");
	
	tetrisGame.addTetronimo();
	var index = tetrisGame.tetronimoes.length - 1, local = tetrisGame;
	
	socket.emit("init", tetrisGame.toJSON());
	socket.on("message", function(message) {
		if (message.indexOf("_") < 0) { // Don't allow access to private methods
			local[message](index);
		}
	});
});