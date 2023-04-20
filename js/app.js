(function ($) {
	var $canvas = $("#tetris-canvas"),
		height = $canvas.height(),
		$linesCount = $("#lines-count"),
		$level = $("#level"),
		$playersCount = $("#players-count");
		
	$canvas
		.attr("width", height / 2)
		.attr("height", height)
		.css("width", (height / 2) + "px");
		
	var socket = io.connect("https://a78e-174-72-122-238.ngrok-free.app"),
		tetrisCanvas = null,
		tetrisSolver = null;
		
	socket.on("init", function (data) {
		tetrisCanvas = new TetrisCanvas($canvas[0], data.tetrisGame, data.id, {
			moveIntervalMillis: 75,
			cellSize: Math.floor(height / 20),
			colorGeneratorFunction: function (id) {
				return "rgb(" + (id.charCodeAt(0) * 2) + ", " + (id.charCodeAt(1) * 2) + ", " + (id.charCodeAt(2) * 2) + ")";
			}
		});

		window.onkeydown = tetrisCanvas.handleKeyDown;

		tetrisCanvas.on("all", function (event) {
			socket.send(event);
		});

		tetrisSolver = new TetrisSolver(data.tetrisGame, data.id);
		$("#controls").one("click", function () {
			tetrisSolver.isActive = true;
			tetrisSolver.makeBestMove();
		});
		tetrisSolver.on("all", function (event) {
			if (tetrisSolver.isActive) socket.send(event);
		});
		tetrisSolver.makeBestMove();
	});
	
	socket.on("change:data", function (tetrisGame) {
		if (tetrisCanvas === null) return;
		
		tetrisCanvas.tetrisGame = tetrisSolver.tetrisGame = tetrisGame;
		window.requestAnimationFrame(tetrisCanvas.draw);
		
		$linesCount.html(tetrisGame.linesCount);
		$level.html(tetrisGame.level);
		$playersCount.html(tetrisGame.tetrominoesCount);

		tetrisSolver.makeBestMove();
	});
	
	socket.on("change:tetromino", function (data) {
		if (tetrisCanvas === null) return;
		
		tetrisCanvas.tetrisGame.tetrominoes[data.id] = data.tetromino;
		window.requestAnimationFrame(tetrisCanvas.draw);
	});
	
	socket.on("game-over", function () {
		tetrisCanvas = null;
		socket.disconnect();
		window.location.reload();
	});
})(jQuery);