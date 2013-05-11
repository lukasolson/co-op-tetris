function TetrisCanvas(canvas, tetrisGame, options) {
	_.bindAll(this);
	
	this.canvas = canvas;
	this.tetrisGame = tetrisGame;
	this.context = canvas.getContext("2d");
	this.options = options;
	
	window.onkeydown = this.handleKeyDown;
}

TetrisCanvas.keyEventMap = {
	13: "dropTetronimo",            // Enter
	37: "moveTetronimoLeft",        // Left
	38: "rotateTetronimoClockwise", // Up
	39: "moveTetronimoRight",       // Right
	40: "moveTetronimoDown"         // Down
};

TetrisCanvas.prototype = {
	draw: function() {
		this._clear();
		this._drawGrid();
		this._drawTetronimoes();
	},
	
	handleKeyDown: function(event) {
		var event = TetrisCanvas.keyEventMap[event.keyCode];
		event && this.trigger(event);
	},
	
	_clear: function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	
	_drawGrid: function() {
		for (var row = 0; row < this.tetrisGame.data.length; row++) {
			for (var col = 0; col < this.tetrisGame.data[row].length; col++) {
				if (this.tetrisGame.data[row][col]) {
					this._drawCell(row, col, this.options.colors[this.tetrisGame.data[row][col] - 1]);
				}
			}
		}
	},
	
	_drawCell: function(row, col, color) {
		this.context.fillStyle = color;
		this.context.fillRect(
			col * this.options.cellSize,
			row * this.options.cellSize,
			this.options.cellSize,
			this.options.cellSize
		);
	},
	
	_drawTetronimoes: function() {
		for (var i = 0; i < this.tetrisGame.tetronimoes.length; i++) {
			if (i !== this.tetronimoIndex) this._drawTetronimo(i);
		}
		this._drawTetronimo(this.tetronimoIndex); // Draw ours last so it's not hidden behind other players
	},
	
	_drawTetronimo: function(index) {
		var tetronimo = this.tetrisGame.tetronimoes[index];
		for (var row = 0; row < tetronimo.data.length; row++) {
			for (var col = 0; col < tetronimo.data[row].length; col++) {
				if (tetronimo.data[row][col]) {
					this._drawCell(tetronimo.row + row, tetronimo.col + col, this.options.colors[index]);
				}
			}
		}
	}
};

_.extend(TetrisCanvas.prototype, Backbone.Events);