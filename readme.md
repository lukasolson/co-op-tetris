# Co-Op Tetris

Play Tetris collaboratively with your friends!

1. Change the IP addresses in `client/index.html:6` and `client/js/app.js:12` to the IP address of your machine
1. `cd` to the `server` directory, and run `npm install`
1. `npm start`

TODO:

1. Set a cookie so refreshing doesn't create a new player
1. Grow the board when a new player enters
1. Only one event broadcast when a tetronimo is dropped
1. Only broadcast changes, rather than entire board
1. Game over animation
1. Chat functionality
1. Normalize how tetronimo index is used across the board