let view = {
    displayMessage: function(msg) {
        let messageArea = document.getElementById('messageArea');
        messageArea.innerHTML = msg;
    },

    displayHit: function(location) {
        let cell = document.getElementById(location);
        cell.setAttribute('class', 'target-td hit');
    },

    displayMiss: function(location) {
        let cell = document.getElementById(location);
        cell.setAttribute('class', 'target-td miss');
    }
};


let model = {
    boardSize: 7,
    numShips: 3,
    shipLength: 3,
    shipsSunk: 0,

    ships: [{ locations: [0, 0, 0], hits: ['', '', ''] },
            { locations: [0, 0, 0], hits: ['', '', ''] },
            { locations: [0, 0, 0], hits: ['', '', ''] }],

    fire: function(guess) {
        for (var i = 0; i < this.numShips; i++) {
            let ship = this.ships[i];
            let index = ship.locations.indexOf(guess);
            if (index >= 0) {
                if (ship.hits[index] !== 'hit') {
                    ship.hits[index] = 'hit';
                    view.displayHit(guess);
                    view.displayMessage('ПОПАЛ!!!');
                    if (this.isSunk(ship)) {
                        view.displayMessage('УБИЛ!!!')
                        this.shipsSunk++;
                    }
                    return true;
                } else {
                    view.displayMessage('ТУТ УЖЕ ПОДБИТО!!! Попытка учитывается в общем подсчёте. Будьте внимательнее!')
                    return false;
                }
                
            }
        }
        view.displayMiss(guess);
        view.displayMessage('МИМО!!!');
        return false;
    },

    isSunk: function(ship) {
        for (var i = 0; i < this.shipLength; i++) {
            if (ship.hits[i] !== 'hit') {
                return false;
            }                            
        }
        return true;
    },

    generateShipLocations: function() {
        let locations;
        for (var i = 0; i < this.numShips; i++) {
            do {
                locations = this.generateShip();
            } while (this.collision(locations));
            this.ships[i].locations = locations;
        }
    },

    generateShip: function() {
        let direction = Math.floor(Math.random() * 2);
        let row, col;

        //1 - horizontal, 0 - vertical
        if (direction === 1) {
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
        } else {
            row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
            col = Math.floor(Math.random() * this.boardSize);
        }

        let newShipLocations = [];
        for (var i = 0; i < this.shipLength; i++) {
            if (direction === 1) {
                newShipLocations.push(row + '' + (col + i));
            } else {
                newShipLocations.push((row + i) + '' + col);
            }
        }
        return newShipLocations;
    },

    collision: function(locations) {
        for (var i = 0; i < this.numShips; i++) {
            let ship = this.ships[i];
            for (var j = 0; j < locations.length; j++) {
                if (ship.locations.indexOf(locations[j]) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }

};

let controller = {
    guesses: 0,

    processGuess: function(guess) {
        let location = parseGuess(guess);
        if (location) {
            processShoot(location);
        }
    },

    processClick: function(location) {
        if (location) {
            processShoot(location);
        }
    }
};

function processShoot(location) {
    if (model.shipsSunk === model.numShips) {
        return view.displayMessage('Игра окончена! Обновите страницу, чтобы начать новую!');
    }
    controller.guesses++;
    let hit = model.fire(location);
    if (hit && model.shipsSunk === model.numShips) {
        view.displayMessage('Все корабли пошли ко дну за ' + controller.guesses + ' попытки(ок)');
    }
}

function parseGuess(guess) {
    let alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    if (guess === null || guess.length !== 2) {
        alert('Ну явно же какую-то хрень ввели! Выстрел не засчитан.');
    } else {
        let firstChar = guess.charAt(0);
        let row = alphabet.indexOf(firstChar.toUpperCase());
        let column = guess.charAt(1);

        if (isNaN(row) || isNaN(column)) {
            alert('Это несерьёзно! Выстрел не засчитан. Соберись!');
        } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
            alert('Что-то на космическом! Выстрел не засчитан. Вернитесь в пределы игрового поля!');
        } else {
            return row + column;
        }
    }
    return null;
};

function init() {
    let fireButton = document.getElementById('fireButton');
    fireButton.onclick = handleFireButton;
    let guessInput = document.getElementById('guessInput');
    guessInput.onkeyup = handleKeyPress;

    let targets = document.getElementsByClassName('target-td');
    for (var i = 0; i < targets.length; i++) {
        targets[i].onclick = handleTargetClick;
    }

    model.generateShipLocations();
};

function handleFireButton() {
    let guessInput = document.getElementById('guessInput');
    let guess = guessInput.value;
    controller.processGuess(guess);
    guessInput.value = '';
};

function handleKeyPress(e) {
    let fireButton = document.getElementById('fireButton');
    if (e.keyCode === 13) {
        fireButton.click();
        return false;
    }
};

function handleTargetClick(e) {
    let location = e.target.getAttribute('id');
    controller.processClick(location);
}

window.onload = init;