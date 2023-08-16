import './App.css';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Square({ value, onClick }) {
  const color =
    value === 'X' ? 'blue' : value === 'O' ? 'red' : 'black';

  return (
    <button className="square" onClick={onClick} style={{ color }}>
      {value}
    </button>
  );
}

function Board({ currentPlayer, squares, onPlay, winner }) {
  function handleClick(column) {
    if (winner || squares[column]) {
      return;
    }

    const nextSquares = squares.slice();
    const row = getEmptyRow(column);
    if (row !== -1) {
      nextSquares[row * 7 + column] = currentPlayer;
      onPlay(nextSquares);
    }
  }

  function getEmptyRow(column) {
    for (let row = 5; row >= 0; row--) {
      if (!squares[row * 7 + column]) {
        return row;
      }
    }
    return -1; // Column is full
  }

  return (
    <div className="boardClass">
      <div className="titleText">Four in a Row</div>

      {winner && (
        <div>{winner === 'tie' ? "It's a tie!" : `${winner} wins!`}</div>
      )}
      <div className="board">
        {[...Array(6)].map((_, row) => (
          <div className="board-row" key={row}>
            {[...Array(7)].map((_, col) => {
              const index = row * 7 + col;
              return (
                <Square
                  key={index}
                  value={squares[index]}
                  onClick={() => handleClick(col)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


//GAME

export default function Game() {
  const [history, setHistory] = useState([Array(42).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  //FETCHING RECORDS
  const [records, setRecords] = useState([]);

  //ADDING NAME TOTAL MOVES AND ENDGAME
  const [name, setName] = useState('');
  const [totalMoves, setTotalMoves] = useState(0);
  const [gameEnded, setGameEnded] = useState(false); // New state variable
  const [gameEndedTie, setGameEndedTie] = useState(false); //New state for a tie

  //TOGGLE FOR SCORES
  const [showRecords, setShowRecords] = useState(false);

  const toggleRecords = () => {
    setShowRecords(!showRecords);
  };


  //Function to run when game wins
  // function sendScore(tableName, tableScore) {
  //   console.log("The values are: " + tableName + " " + tableScore);
  // }

  // function handleOnSubmit(e) {
  //   e.preventDefault();
  //   console.log("Got here, values are: " + document.getElementById("name-input") + " " + {totalMoves});
  //   sendScore(document.getElementById("name-input").innerText, {totalMoves});
  // }
  
 // This function will handle the submission.
 async function onSubmit(e) {
  e.preventDefault();


  // When a post request is sent to the create url, we'll add a new record to the database.
  console.log("Got here: " + name + " " + totalMoves);
  const dataToSend = {
    name: name,
    moves: totalMoves,
  };

  

  const response = await fetch("http://localhost:5050/record", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     //converting form data into JSON format
     body: JSON.stringify(dataToSend),
   })
   .catch(error => {
     window.alert(error);
     return;
   });

  if (response.ok) {
    console.log('Submitted okay');
    window.location.reload();

  }

//  // After form data has been submitted, it is blanked out.
//   setForm({ name: "", position: "", level: "" });
//   navigate("/");
}
  
  //UPDATES TO INCREMENT TOTALMOVES
  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setTotalMoves(nextHistory.length - 1);
  }

  function jumpTo(move) {
    setCurrentMove(move);
  }

  // GETS WINNER AND CHECKS END GAME CONDITION
  useEffect(() => {
    const winner = calculateWinner(currentSquares);
    if (winner) {
      setGameEnded(true);
    }
  }, [currentSquares, totalMoves]);

  // ENDS GAME IF THERES A TIE
  useEffect(() => {
    if (totalMoves === 42) {
      setGameEndedTie(true);
    }
  }, [currentSquares, totalMoves]);


  // Fetch records from the server when the component mounts or when the `records` state changes
  useEffect(() => {
    async function getRecords() {
    const response = await fetch(`http://localhost:5050/record/`);

    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      window.alert(message);
      return;
    }

    const records = await response.json();
    setRecords(records);
  }

  getRecords();
}, [records.length]);
  const moves = history.map((squares, move) => {
    let description;
    if (move === 0) {
      description = 'Player X Start';
    } else if (move % 2 === 0) {
      description = 'Player X Turn';
    } else {
      description = 'Player O Turn';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  //GETS WINNER
  const winner = calculateWinner(currentSquares);
  //IF TIE OR WINNER FOUND, SETS END GAME
  //if (winner || totalMoves === 41) {
  //setGameEnded(true);
  //}

  // The <ol>{moves}</ol> records the game
  // Second part Adds Name: and TotalMoves
  return (
    <div className="game">
      <div className="game-board">
        <Board
          currentPlayer={xIsNext ? 'X' : 'O'}
          squares={currentSquares}
          onPlay={handlePlay}
          winner={winner}
        />
      </div>

      <div className="game-info">
        <div>Total Moves: {totalMoves}</div>
        <ol>{moves}</ol>
      </div>

    
      {gameEnded && winner !== 'tie' && (
        <div className="name-popup">
          <div className="name-popup-content">
            
            <label htmlFor="name-input"> Player {winner}, You WON! Please enter your name:</label>
            <form onSubmit={onSubmit}>
              <div>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {name.length === 0 && <p>Please enter a name</p>}
                <input
                  type="hidden"
                  id="moves"
                  value={totalMoves}
                  onChange={(e) => setName(e.target.value)}
                />
                <button disabled={name.length === 0}>Send Score</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {gameEndedTie && (
        <div className="name-popup">
          <div className="name-popup-content">
            
            <label htmlFor="name-input">It's a TIE! Well played!</label>
            <form onSubmitTie={onSubmit}>
              <button>Play Again</button>
            </form>
          </div>
        </div>
      )}




      <div className="BestScoresButton">
        <button className="btn btn-primary" onClick={toggleRecords}>
          Show Top Scores
        </button>

        <div className={`records ${showRecords ? 'd-block' : 'd-none'}`}>
          <h2>Top Scores</h2>
          <ul className="list-group">
            {records
              .sort((a, b) => a.moves - b.moves)
              .map((record, index) => (
                <li key={index} className="list-group-item">
                  <span>{record.name}</span> <span className="float-end">{record.moves}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>         


    </div>
  );


}

//WINNING TYPES
function calculateWinner(squares) {
  const lines = [
    // Horizontal wins
    [0, 1, 2, 3],
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6],
    [7, 8, 9, 10],
    [8, 9, 10, 11],
    [9, 10, 11, 12],
    [10, 11, 12, 13],
    [14, 15, 16, 17],
    [15, 16, 17, 18],
    [16, 17, 18, 19],
    [17, 18, 19, 20],
    [21, 22, 23, 24],
    [22, 23, 24, 25],
    [23, 24, 25, 26],
    [24, 25, 26, 27],
    [28, 29, 30, 31],
    [29, 30, 31, 32],
    [30, 31, 32, 33],
    [31, 32, 33, 34],
    [35, 36, 37, 38],
    [36, 37, 38, 39],
    [37, 38, 39, 40],
    [38, 39, 40, 41],

    // Vertical wins
    [0, 7, 14, 21],
    [1, 8, 15, 22],
    [2, 9, 16, 23],
    [3, 10, 17, 24],
    [4, 11, 18, 25],
    [5, 12, 19, 26],
    [6, 13, 20, 27],
    [7, 14, 21, 28],
    [8, 15, 22, 29],
    [9, 16, 23, 30],
    [10, 17, 24, 31],
    [11, 18, 25, 32],
    [12, 19, 26, 33],
    [13, 20, 27, 34],
    [14, 21, 28, 35],
    [15, 22, 29, 36],
    [16, 23, 30, 37],
    [17, 24, 31, 38],
    [18, 25, 32, 39],
    [19, 26, 33, 40],
    [20, 27, 34, 41],

    // Diagonal wins
    [0, 8, 16, 24],
    [1, 9, 17, 25],
    [2, 10, 18, 26],
    [3, 11, 19, 27],
    [3, 9, 15, 21],
    [4, 10, 16, 22],
    [5, 11, 17, 23],
    [6, 12, 18, 24],
    [7, 15, 23, 31],
    [8, 16, 24, 32],
    [9, 17, 25, 33],
    [10, 18, 26, 34],
    [10, 16, 22, 28],
    [11, 17, 23, 29],
    [12, 18, 24, 30],
    [13, 19, 25, 31],
    [14, 22, 30, 38],
    [15, 23, 31, 39],
    [16, 24, 32, 40],
    [17, 25, 33, 41],
    [17, 23, 29, 35],
    [18, 24, 30, 36],
    [19, 25, 31, 37],
    [20, 26, 32, 38]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c, d] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c] &&
      squares[a] === squares[d]
    ) {
      return squares[a];
    }
  }

  if (squares.every((square) => square !== null)) {
    return 'tie';
  }

  return null;
}