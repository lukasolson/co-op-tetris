function TetrisCanvas(canvas, tetrisGame, tetrominoId, options) {
	_.bindAll(this, "draw", "handleKeyDown");
	
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.tetrisGame = tetrisGame;
	this.tetrominoId = tetrominoId;
	this.options = options;
	this.colors = {};
}

TetrisCanvas.keyEventMap = {
	13: "dropTetromino",            // Enter
	37: "moveTetrominoLeft",        // Left
	38: "rotateTetrominoClockwise", // Up
	39: "moveTetrominoRight",       // Right
	40: "moveTetrominoDown"         // Down
};

TetrisCanvas.prototype = {
	draw: function () {
		this._clear();
		this._drawGrid();
		this._drawTetrominoes();
	},
	
	handleKeyDown: function (event) {
		var event = TetrisCanvas.keyEventMap[event.keyCode];
		event && this.trigger(event);
	},
	
	_clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	
	_drawGrid: function () {
		for (var row = 0; row < this.tetrisGame.data.length; row++) {
			for (var col = 0; col < this.tetrisGame.data[row].length; col++) {
				if (this.tetrisGame.data[row][col]) {
					this._drawCell(row, col, this.tetrisGame.data[row][col]);
				}
			}
		}
	},
	
	_drawCell: function (row, col, tetrominoId) {
		var color = this.colors[tetrominoId] || (this.colors[tetrominoId] = this.options.colorGeneratorFunction(tetrominoId));
		this.context.fillStyle = color;
		this.context.fillRect(
			col * this.options.cellSize,
			row * this.options.cellSize,
			this.options.cellSize,
			this.options.cellSize
		);
	},
	
	_drawTetrominoes: function () {
		var i = 0;
		for (var id in this.tetrisGame.tetrominoes) {
			if (id !== this.tetrominoId) this._drawTetromino(id);
		}
		this._drawTetromino(this.tetrominoId); // Draw ours last so it's not hidden behind other players
	},
	
	_drawTetromino: function (id) {
		var tetromino = this.tetrisGame.tetrominoes[id];
		for (var row = 0; row < tetromino.data.length; row++) {
			for (var col = 0; col < tetromino.data[row].length; col++) {
				if (tetromino.data[row][col]) {
					this._drawCell(tetromino.row + row, tetromino.col + col, id);
				}
			}
		}
	}
};

_.extend(TetrisCanvas.prototype, Backbone.Events);