import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={`square ${props.highlighted ? "isWinningPosition" : ""}`}
            onClick={props.onClick}>
      {props.value}          
    </button>
  );
}

class Board extends React.Component {
   renderSquare(i) {
     const isHighlightedSquare = this.props.winningPosition && this.props.winningPosition.indexOf(i) > -1;
    return (
      <Square value={this.props.squares[i]} 
              onClick={() => this.props.onClick(i)}
              highlighted={isHighlightedSquare}
      />);
  }

  render() {
    let rows = [];

    for(let i = 0; i < 3; i++) {
      let col = [];
        for (let j = 0; j < 3; j++) {
          col.push(this.renderSquare(3*i + j));           
        }          
      rows.push((<div className="board-row">{col}</div>));
    }

    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true,
      squaresFilled: 0
    }
  }

  jumpToMove(step) {
    this.setState({
      stepNumber: step,
      xIsNext: ((step % 2) === 0)
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    
    const squares = current.squares.slice();

    if(calculateWinner(squares).winner || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat({
        squares: squares,
        movePosition: i
      }),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      isShowingMovesAscending: true,
      squaresFilled: this.state.squaresFilled + 1,
    });
  }

  handleSortToggle() {
    this.setState({
      isShowingMovesAscending: !this.state.isShowingMovesAscending
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const {winner, winningPosition } = calculateWinner(current.squares);

    let moves = history.map((steps, moveNum) => {
      const desc = moveNum ? `Go to move #: ${moveNum} (${getColumnPositionFromMovePosition(moveNum)}, ${getRowPositionFromMovePosition(moveNum)})` : "Go to game Start";
      return (
        <li key={moveNum} className={this.state.stepNumber === moveNum ? "bold" : ""}>
          <button onClick={() => {this.jumpToMove(moveNum)}}>
            {desc}
          </button>
        </li>
      );
    });
    
    let status;
    if(winner) {
      status = `Winner: ${winner}`;
    }
    else if(this.state.squaresFilled === 9) {
      status = `The Result Is A Draw`;
    }
    else {
      status = `Next player: ${this.state.xIsNext ? "X" : "O"}`;
    }


    const sortingMessage = this.state.isShowingMovesAscending ? "Sorted Ascending By Age" : "Sorted Decending By Age";
    const shortToggleButtonText =  this.state.isShowingMovesAscending ? "Sort Descending" : "Sort Ascending";
    if(!this.state.isShowingMovesAscending) {
      moves = moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board  squares={current.squares}
                  onClick={(i) => { this.handleClick(i) }}
                  winningPosition={winningPosition}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <label>{sortingMessage}</label>
            <button onClick={() => { this.handleSortToggle() }}>{shortToggleButtonText}</button>
          </div>
          <ol>{ moves }</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);


function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];


  for (let index = 0; index < lines.length; index++) {
    const [a,b,c] = lines[index];
    if(squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
      return { 
        winner: squares[a],
        winningPosition: [a,b,c]
      }
    }
  }
  return {};
}


function getColumnPositionFromMovePosition(movePosition) {
  const moduloWithThree = movePosition % 3;
  return moduloWithThree === 0 ? 1 : moduloWithThree === 1 ? 2 : 3;
}

function getRowPositionFromMovePosition(movePosition) {
  return Math.ceil(movePosition / 3);
}