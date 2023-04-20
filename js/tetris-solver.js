function TetrisSolver(tetrisGame, tetrominoId, options) {
	this.tetrisGame = tetrisGame;
	this.tetrominoId = tetrominoId;
	this.options = options || {
		touchingPerimeterFactor: 1,
		heightFactor: -0.01
	};
}

TetrisSolver.prototype = {
	makeBestMove: function () {
		var solutions = this.getSolutions({}, this.tetrisGame.tetrominoes[this.tetrominoId], []).sort(function (a, b) {
			return b.score - a.score;
		});

		var moves = solutions[0].moves;
//		moves.push("moveTetrominoDown");

		for (var i = 0; i < moves.length; i++) {
			this.trigger(moves[i]);
		}
	},

	getSolutions: function (processedNodes, tetromino, moves) {
		var solutions = [];

		var tetrominoJson = JSON.stringify(tetromino);
		if (processedNodes[tetrominoJson]) return solutions;

		processedNodes[tetrominoJson] = true;

		var collides = false, isValidMove = 0;
		for (var row = 0; row < tetromino.data.length; row++) {
			for (var col = 0; col < tetromino.data[row].length; col++) {
				if (!tetromino.data[row][col]) continue;
				collides = collides || (
					tetromino.row + row >= this.tetrisGame.data.length
					|| tetromino.col + col < 0
					|| tetromino.col + col >= this.tetrisGame.data[tetromino.row + row].length
					|| this.tetrisGame.data[tetromino.row + row][tetromino.col + col]
				);
				isValidMove = isValidMove || (
					tetromino.row + row + 1 >= this.tetrisGame.data.length
					|| (this.tetrisGame.data[tetromino.row + row + 1][tetromino.col + col])
				);
			}
		}

		if (collides) return solutions;
		if (isValidMove) {
			solutions.push({
				tetromino: tetromino,
				moves: moves,
				score: this.getTetrominoScore(tetromino)
			});
		}

		solutions = solutions.concat(this.getSolutions(processedNodes, {row: tetromino.row + 1, col: tetromino.col, data: tetromino.data}, moves.slice().concat(["moveTetrominoDown"])));
		solutions = solutions.concat(this.getSolutions(processedNodes, {row: tetromino.row, col: tetromino.col + 1, data: tetromino.data}, moves.slice().concat(["moveTetrominoRight"])));
		solutions = solutions.concat(this.getSolutions(processedNodes, {row: tetromino.row, col: tetromino.col - 1, data: tetromino.data}, moves.slice().concat(["moveTetrominoLeft"])));
		solutions = solutions.concat(this.getSolutions(processedNodes, {row: tetromino.row, col: tetromino.col, data: this.rotateTetromino(tetromino.data)}, moves.slice().concat(["rotateTetrominoCounterClockwise"])));
		return solutions;
	},

	rotateTetromino: function (data) {
		var newData = [];
		for (var col = 0; col < data[0].length; col++) {
			newData.push([]);
			for (var row = data.length - 1; row >= 0; row--) {
				newData[col].push(data[row][col]);
			}
		}
		return newData;
	},

	getTetrominoScore: function (tetromino) {
		return (
			this.options.touchingPerimeterFactor * this.getTetrominoTouchingPerimeter(tetromino)
			+ this.options.heightFactor * this.getTetrominoHeight(tetromino)
		);
	},

	getTetrominoTouchingPerimeter: function (tetromino) {
		var surfaceArea = 0;
		for (var row = 0; row < tetromino.data.length; row++) {
			for (var col = 0; col < tetromino.data[row].length; col++) {
				if (!tetromino.data[row][col]) continue;
				if (tetromino.row + row > 0 && this.tetrisGame.data[tetromino.row + row - 1][tetromino.col + col]) surfaceArea++;
				if (tetromino.row + row + 1 >= this.tetrisGame.data.length || this.tetrisGame.data[tetromino.row + row + 1][tetromino.col + col]) surfaceArea++;
				if (tetromino.col + col - 1 < 0 || this.tetrisGame.data[tetromino.row + row][tetromino.col + col - 1]) surfaceArea++;
				if (tetromino.col + col + 1 >= this.tetrisGame.data[tetromino.row + row].length || this.tetrisGame.data[tetromino.row + row][tetromino.col + col + 1]) surfaceArea++;
			}
		}
		return surfaceArea;
	},

	getTetrominoHeight: function (tetromino) {
		return this.tetrisGame.data.length - tetromino.row;
	}
};

_.extend(TetrisSolver.prototype, Backbone.Events);