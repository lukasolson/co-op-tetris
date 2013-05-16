function TetrisCanvas(canvas, tetrisGame, tetronimoId, options) {
	_.bindAll(this);
	
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.tetrisGame = tetrisGame;
	this.tetronimoId = tetronimoId;
	this.options = options;
	this.colors = {};
	
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
	draw: function () {
		this._clear();
		this._drawGrid();
		this._drawTetronimoes();
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
	
	_drawCell: function (row, col, tetronimoId) {
		var color = this.colors[tetronimoId] || (this.colors[tetronimoId] = this.options.colorGeneratorFunction(tetronimoId));
		this.context.fillStyle = color;
		this.context.fillRect(
			col * this.options.cellSize,
			row * this.options.cellSize,
			this.options.cellSize,
			this.options.cellSize
		);
	},
	
	_drawTetronimoes: function () {
		var i = 0;
		for (var id in this.tetrisGame.tetronimoes) {
			if (id !== this.tetronimoId) this._drawTetronimo(id);
		}
		this._drawTetronimo(this.tetronimoId); // Draw ours last so it's not hidden behind other players
	},
	
	_drawTetronimo: function (id) {
		var tetronimo = this.tetrisGame.tetronimoes[id];
		for (var row = 0; row < tetronimo.data.length; row++) {
			for (var col = 0; col < tetronimo.data[row].length; col++) {
				if (tetronimo.data[row][col]) {
					this._drawCell(tetronimo.row + row, tetronimo.col + col, id);
				}
			}
		}
	}
};

_.extend(TetrisCanvas.prototype, Backbone.Events);