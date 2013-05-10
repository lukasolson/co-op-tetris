var _ = require("underscore"),
	Events = require("backbone").Events;

function TetrisGame(rows, cols, options) {
	_.bindAll(this);
	
	this.options = options;
	
	this.tetronimoes = [];
	this.linesCount = 0;
	this.level = 0;
	
	this.data = [];
	for (var row = 0; row < rows; row++) {
		this.data.push(this._getEmptyLine(cols));
	}
	
	this._setFallInterval(1000);
}

TetrisGame.prototype = {
	toJSON: function() {
		return {
			data: this.data,
			tetronimoes: this.tetronimoes,
			linesCount: this.linesCount,
			level: this.level
		};
	},
	
	addTetronimo: function() {
		this.tetronimoes.push({});
		this._newTetronimo(this.tetronimoes.length - 1);
	},
	
	moveTetronimoLeft: function(index) {
		this._modifyTetronimo(index, this.tetronimoes[index].moveLeft);
	},
	
	moveTetronimoRight: function(index) {
		this._modifyTetronimo(index, this.tetronimoes[index].moveRight);
	},
	
	moveTetronimoDown: function(index) {
		this._modifyTetronimo(index, this.tetronimoes[index].moveDown, this._placeTetronimo);
	},
	
	rotateTetronimoClockwise: function(index) {
		this._modifyTetronimo(index, this.tetronimoes[index].rotateClockwise);
	},
	
	rotateTetronimoCounterClockwise: function(index) {
		this._modifyTetronimo(index, this.tetronimoes[index].rotateCounterClockwise);
	},
	
	dropTetronimo: function(index) {
		// Move the tetronimo downwards until it hits and another tetronimo is created
		var tetronimo = this.tetronimoes[index];
		while (tetronimo === this.tetronimoes[index]) {
			this.moveTetronimoDown(index);
		}
	},
	
	_getEmptyLine: function(cols) {
		var line = [];
		for (var col = 0; col < cols; col++) {
			line.push(0);
		}
		return line;
	},
	
	_newTetronimo: function(index) {
		var col = Math.floor(this.data[0].length / 2) - 1;
		this.tetronimoes[index] = TetrisGame.Tetronimo.random(0, col);
		this.trigger("change:tetronimo", index);
		
		if (this._doesTetronimoCollide(index)) {
			this._gameOver();
		}
	},
	
	_doesTetronimoCollide: function(index) {
		var tetronimo = this.tetronimoes[index];
		for (var row = 0; row < tetronimo.data.length; row++) {
			for (var col = 0; col < tetronimo.data[row].length; col++) {
				if (tetronimo.data[row][col] && this._isCellOccupied(
					row + tetronimo.row,
					col + tetronimo.col
				)) return true;
			}
		}
		
		return false;
	},
	
	_isCellOccupied: function(row, col) {
		return typeof this.data[row] === "undefined" // Above/below the boundaries
			|| typeof this.data[row][col] === "undefined" // To the left/right of the boundaries
			|| this.data[row][col] !== 0; // The cell is occupied
	},
	
	_gameOver: function() {
		clearInterval(this._fallInterval);
		this.trigger("game-over");
		this.off();
	},
	
	_setFallInterval: function(millis) {
		this._fallIntervalMillis = millis || this._fallIntervalMillis;
		if (this._fallInterval) clearInterval(this._fallInterval);
		this._fallInterval = setInterval(this._moveTetronimoesDown, this._fallIntervalMillis);
	},
	
	_modifyTetronimo: function(index, modificationFunction, collisionFunction) {
		var tetronimo = _.clone(this.tetronimoes[index]);
		
		modificationFunction.call(this.tetronimoes[index]);
		if (this._doesTetronimoCollide(index)) {
			_.extend(this.tetronimoes[index], tetronimo);
			if (typeof collisionFunction !== "undefined") collisionFunction.call(this, index);
		} else {
			this.trigger("change:tetronimo", index);
		}
	},
	
	_placeTetronimo: function(index) {
		var tetronimo = this.tetronimoes[index];
		for (var row = 0; row < tetronimo.data.length; row++) {
			for (var col = 0; col < tetronimo.data[row].length; col++) {
				this.data[row + tetronimo.row][col + tetronimo.col] || (this.data[row + tetronimo.row][col + tetronimo.col] = tetronimo.data[row][col]);
			}
		}
		this._removeCompleteLines();
		this._newTetronimo(index);
		this.trigger("change:data");
	},
	
	_removeCompleteLines: function() {
		var row = this.data.length;
		while (--row >= 0) {
			if (this._isCompleteLine(row)) {
				this.data.splice(row, 1);
				this.data.unshift(this._getEmptyLine(this.data[0].length));
				this._incrementLinesCount();
				row++;
			}
		}
	},
	
	_isCompleteLine: function(row) {
		for (var col = 0; col < this.data[row].length; col++) {
			if (!this._isCellOccupied(row, col)) return false;
		}
		return true;
	},
	
	_incrementLinesCount: function() {
		this.linesCount++;
		if (this.linesCount % this.options.levelLinesCount === 0) {
			this._levelUp();
		}
	},
	
	_levelUp: function() {
		this.level++;
		this._setFallInterval(this._fallIntervalMillis * this.options.levelFallIntervalMultiplier);
	},
	
	_moveTetronimoesDown: function() {
		for (var i = 0; i < this.tetronimoes.length; i++) {
			this.moveTetronimoDown(i);
		}
	}
};

_.extend(TetrisGame.prototype, Events);

TetrisGame.Tetronimo = function Tetronimo(row, col, data) {
	_.bindAll(this);
	
	this.row = row;
	this.col = col;
	this.data = data;
}

TetrisGame.Tetronimo.templates = [
	[
		[1, 1, 1, 1]
	], [
		[2, 0, 0],
		[2, 2, 2]
	], [
		[0, 0, 3],
		[3, 3, 3]
	], [
		[4, 4],
		[4, 4]
	], [
		[5, 5, 0],
		[0, 5, 5]
	], [
		[0, 6, 6],
		[6, 6, 0]
	], [
		[0, 7, 0],
		[7, 7, 7]
	]
];

TetrisGame.Tetronimo.random = function(row, col) {
	return new TetrisGame.Tetronimo(row, col, TetrisGame.Tetronimo.templates[
		Math.floor(Math.random() * TetrisGame.Tetronimo.templates.length)
	]);
};

TetrisGame.Tetronimo.prototype = {
	moveLeft: function() {
		this.col -= 1;
	},
	
	moveRight: function() {
		this.col += 1;
	},
	
	moveDown: function() {
		this.row += 1;
	},
	
	rotateClockwise: function() {
		this._rotate(1);
	},
	
	rotateCounterClockwise: function() {
		this._rotate(-1);
	},
	
	_rotate: function(x) {
		var data = [];
		for (var col = Math.max(0, -x * (1 - this.data[0].length)); col >= 0 && col < this.data[0].length; col -= x) {
			data.push([]);
			for (var row = Math.max(0, x * (1 - this.data.length)); row >= 0 && row < this.data.length; row += x) {
				data[data.length - 1].push(this.data[row][col]);
			}
		}
		this.data = data;
	},
};

module.exports = TetrisGame;