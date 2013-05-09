(function($) {
	var $canvas = $("#tetris-canvas"),
		height = $canvas.height(),
		$linesCount = $("#lines-count"),
		$level = $("#level");
		
	$canvas
		.attr("width", height / 2)
		.attr("height", height)
		.css("width", (height / 2) + "px");
		
	var socket = io.connect("http://10.1.11.55:1111"),
		tetrisCanvas = null;
		
	socket.on("init", function (tetrisGame) {
		tetrisCanvas = new TetrisCanvas($canvas[0], tetrisGame, {
			moveIntervalMillis: 75,
			cellSize: Math.floor(height / 20),
			colors: [
				"#404040",
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
	
	socket.on("message", function(tetrisGame) {
		if (tetrisCanvas === null) return;
		
		tetrisCanvas.tetrisGame = tetrisGame;
		$linesCount.html(tetrisGame.linesCount);
		$level.html(tetrisGame.level);
		window.requestAnimationFrame(tetrisCanvas.draw);
	});
	
	socket.on("game-over", function() {
		tetrisCanvas = null;
	});
})(jQuery);