# Co-Op Tetris

Play Tetris collaboratively with your friends!

1. `cd server`
1. `npm install`
1. `npm start`
1. Open `client/index.html` in a browser

To play with friends remotely, you can forward port 1111 by a service like ``localtunnel``:

```
npm install -g localtunnel
npx localtunnel --port 1111
```

Then you'll get a URL to share for people to join your game.



TODO:

1. Show high scores
1. Support for touch devices/mouse
1. Support for tall screens
1. Show next tetromino
1. Show shadow of where tetromino will drop
1. Grow the board when a new player enters
1. Only broadcast one event when a tetromino is dropped
1. Game over animation
1. Chat room

![image](https://user-images.githubusercontent.com/1178348/228062326-7139cc23-d369-49a8-bfdb-096ac4e9b55e.png)
