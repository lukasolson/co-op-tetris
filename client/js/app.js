(function($) {
	var $canvas = $("#tetris-canvas"),
		height = $canvas.height(),
		$linesCount = $("#lines-count"),
		$level = $("#level"),
		$playersCount = $("#players-count");
		
	$canvas
		.attr("width", height / 2)
		.attr("height", height)
		.css("width", (height / 2) + "px");
		
	var socket = io.connect("http://localhost:1111"),
		tetrisCanvas = null;
		
	socket.on("init", function (tetrisGame) {
		tetrisCanvas = new TetrisCanvas($canvas[0], tetrisGame, {
			moveIntervalMillis: 75,
			cellSize: Math.floor(height / 20),
			colors: [
				"#FFFF80",
				"#FF80FF",
				"#80FFFF",
				"#FF8080",
				"#80FF80",
				"#8080FF",
				"#FF8040"
			]
		});
		tetrisCanvas.tetronimoIndex = tetrisGame.tetronimoes.length - 1;
		tetrisCanvas.on("all", function(event) {
			socket.send(event);
		});
	});
	
	socket.on("change:data", function(tetrisGame) {
		if (tetrisCanvas === null) return;
		
		tetrisCanvas.tetrisGame = tetrisGame;
		window.requestAnimationFrame(tetrisCanvas.draw);
		
		$linesCount.html(tetrisGame.linesCount);
		$level.html(tetrisGame.level);
	});
	
	socket.on("change:tetronimo", function(data) {
		if (tetrisCanvas === null) return;
		
		tetrisCanvas.tetrisGame.tetronimoes[data.index] = data.tetronimo;
		window.requestAnimationFrame(tetrisCanvas.draw);
		
		$playersCount.html(tetrisCanvas.tetrisGame.tetronimoes.length);
	});
	
	socket.on("game-over", function() {
		tetrisCanvas = null;
	});
})(jQuery);