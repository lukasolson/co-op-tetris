var _ = require("underscore"),
	Events = require("backbone").Events;

function TetrisGame(rows, cols, options) {
	_.bindAll(this);
	
	this.options = options;
	
	this._tetronimoes = {};
	this._tetronimoesCount = 0;
	this._linesCount = 0;
	this._level = 0;
	this._data = [];
	for (var row = 0; row < rows; row++) {
		this._data.push(this._getEmptyLine(cols));
	}
	
	this._setFallInterval(1000);
}

TetrisGame.prototype = {
	toJSON: function () {
		return {
			data: this._data,
			tetronimoes: this._tetronimoes,
			tetronimoesCount: this._tetronimoesCount,
			linesCount: this._linesCount,
			level: this._level
		};
	},
	
	addTetronimo: function (id) {
		this._tetronimoes[id] = {};
		this._tetronimoesCount++;
		this._newTetronimo(id);
		
		this.trigger("change:data");
	},
	
	removeTetronimo: function (id) {
		delete this._tetronimoes[id];
		this._tetronimoesCount--;
		
		this.trigger("change:data");
	},
	
	moveTetronimoLeft: function (id) {
		this._modifyTetronimo(id, this._tetronimoes[id].moveLeft);
	},
	
	moveTetronimoRight: function (id) {
		this._modifyTetronimo(id, this._tetronimoes[id].moveRight);
	},
	
	moveTetronimoDown: function (id) {
		this._modifyTetronimo(id, this._tetronimoes[id].moveDown, this._placeTetronimo);
	},
	
	rotateTetronimoClockwise: function (id) {
		this._modifyTetronimo(id, this._tetronimoes[id].rotateClockwise);
	},
	
	rotateTetronimoCounterClockwise: function (id) {
		this._modifyTetronimo(id, this._tetronimoes[id].rotateCounterClockwise);
	},
	
	dropTetronimo: function (id) {
		// Move the tetronimo downwards until it hits and another tetronimo is created
		var tetronimo = this._tetronimoes[id];
		while (tetronimo === this._tetronimoes[id]) {
			this.moveTetronimoDown(id);
		}
	},
	
	_getEmptyLine: function (cols) {
		var line = [];
		for (var col = 0; col < cols; col++) {
			line.push(0);
		}
		return line;
	},
	
	_newTetronimo: function (id) {
		var col = Math.floor(this._data[0].length / 2) - 1;
		this._tetronimoes[id] = TetrisGame.Tetronimo.random(0, col);
		this.trigger("change:tetronimo", id);
		
		if (this._doesTetronimoCollide(id)) {
			this._gameOver();
		}
	},
	
	_doesTetronimoCollide: function (id) {
		var tetronimo = this._tetronimoes[id];
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
	
	_isCellOccupied: function (row, col) {
		return typeof this._data[row] === "undefined" // Above/below the boundaries
			|| typeof this._data[row][col] === "undefined" // To the left/right of the boundaries
			|| this._data[row][col] !== 0; // The cell is occupied
	},
	
	_gameOver: function () {
		clearInterval(this._fallInterval);
		this.trigger("game-over");
		this.off();
	},
	
	_setFallInterval: function (millis) {
		this._fallIntervalMillis = millis || this._fallIntervalMillis;
		if (this._fallInterval) clearInterval(this._fallInterval);
		this._fallInterval = setInterval(this._moveTetronimoesDown, this._fallIntervalMillis);
	},
	
	_modifyTetronimo: function (id, modificationFunction, collisionFunction) {
		var tetronimo = _.clone(this._tetronimoes[id]);
		
		modificationFunction.call(this._tetronimoes[id]);
		if (this._doesTetronimoCollide(id)) {
			_.extend(this._tetronimoes[id], tetronimo);
			if (typeof collisionFunction !== "undefined") collisionFunction.call(this, id);
		} else {
			this.trigger("change:tetronimo", id);
		}
	},
	
	_placeTetronimo: function (id) {
		var tetronimo = this._tetronimoes[id];
		for (var row = 0; row < tetronimo.data.length; row++) {
			for (var col = 0; col < tetronimo.data[row].length; col++) {
				if (tetronimo.data[row][col]) {
					this._data[row + tetronimo.row][col + tetronimo.col] = id;
				}
			}
		}
		this._removeCompleteLines();
		this._newTetronimo(id);
		this.trigger("change:data");
	},
	
	_removeCompleteLines: function () {
		var row = this._data.length;
		while (--row >= 0) {
			if (this._isCompleteLine(row)) {
				this._data.splice(row, 1);
				this._data.unshift(this._getEmptyLine(this._data[0].length));
				this._incrementLinesCount();
				row++;
			}
		}
	},
	
	_isCompleteLine: function (row) {
		for (var col = 0; col < this._data[row].length; col++) {
			if (!this._isCellOccupied(row, col)) return false;
		}
		return true;
	},
	
	_incrementLinesCount: function () {
		this._linesCount++;
		if (this._linesCount % this.options.levelLinesCount === 0) {
			this._levelUp();
		}
	},
	
	_levelUp: function () {
		this._level++;
		this._setFallInterval(this._fallIntervalMillis * this.options.levelFallIntervalMultiplier);
	},
	
	_moveTetronimoesDown: function () {
		for (var id in this._tetronimoes) {
			this.moveTetronimoDown(id);
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
		[1]
	], [
		[1, 1]
	], [
		[1, 1, 1]
	], [
		[1, 1],
		[1, 0]
	], [
		[1, 1, 1, 1]
	], [
		[1, 0, 0],
		[1, 1, 1]
	], [
		[0, 0, 1],
		[1, 1, 1]
	], [
		[1, 1],
		[1, 1]
	], [
		[1, 1, 0],
		[0, 1, 1]
	], [
		[0, 1, 1],
		[1, 1, 0]
	], [
		[0, 1, 0],
		[1, 1, 1]
	]
];

TetrisGame.Tetronimo.random = function (row, col) {
	return new TetrisGame.Tetronimo(row, col, TetrisGame.Tetronimo.templates[
		Math.floor(Math.random() * TetrisGame.Tetronimo.templates.length)
	]);
};

TetrisGame.Tetronimo.prototype = {
	moveLeft: function () {
		this.col -= 1;
	},
	
	moveRight: function () {
		this.col += 1;
	},
	
	moveDown: function () {
		this.row += 1;
	},
	
	rotateClockwise: function () {
		this._rotate(1);
	},
	
	rotateCounterClockwise: function () {
		this._rotate(-1);
	},
	
	_rotate: function (x) {
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