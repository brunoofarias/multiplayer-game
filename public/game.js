import { mod } from "./utils.js"

export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 50,
            height: 50
        }
    }

    const observers = []

    function start() {
        const frequency = 2000

        setInterval(addFruit, frequency)
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function setState(newState) {
        Object.assign(state, newState)
    }

    function addPlayer(command) {
        const { playerId } = command
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)
        const score = 0

        state.players[playerId] = {
            x: playerX,
            y: playerY,
            score
        }

        notifyAll({
            type: 'add-player',
            playerId: playerId,
            playerX: playerX,
            playerY:playerY,
            score
        })
    }

    function removePlayer(command) {
        delete state.players[command.playerId]

        notifyAll({
            type: 'remove-player',
            playerId: command.playerId
        })
    }

    function addFruit(command) {
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 1000000) 
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

        notifyAll({
            type: 'add-fruit',
            fruitId: fruitId,
            fruitX: fruitX,
            fruitY:fruitY
        })
    }

    function removeFruit(command) {
        delete state.fruits[command.fruitId]

        notifyAll({
            type: 'remove-fruit',
            fruitId: command.fruitId
        })
    }

    function movePlayer(command) {
        notifyAll(command)

        const acceptedMoves = {
            ArrowUp(player) {
                player.y = mod(state.screen.height, player.y - 1)
            },
            ArrowRight(player) {
                player.x = mod(state.screen.width, player.x + 1)
            },
            ArrowDown(player) {
                player.y = mod(state.screen.height, player.y + 1)
            },
            ArrowLeft(player) {
                player.x = mod(state.screen.width, player.x - 1)
            }
        }

        const { playerId, keyPressed } = command
        const player = state.players[playerId]
        const moveFunction = acceptedMoves[keyPressed]

        if (player && moveFunction) {
            moveFunction(player)
            checkForFruitCollision(playerId)
        }
    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]

            if (player.y === fruit.y && player.x === fruit.x) {
                removeFruit({ fruitId: fruitId })
                player.score += 1
            }
        }
    }

    return {
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        movePlayer,
        state,
        setState,
        subscribe,
        start
    }
}
