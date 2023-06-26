/**
 * *****************************************************************************
 *
 * Frontend User Interface applications
 *
 * @param {object} state
 * @return {object} react element
 *
 * *****************************************************************************
 */

// load components
import React from '../components/React.mjs';
import Button from '../components/Button.mjs';

// import lazy from './components/lazy.mjs';

function Square (props) {
  return React.createElement(Button, { 
    className: 'square border',
    onClick: props.onClick
  }, props.value ? props.value : null);
}

function Board (props) {
  return React.createElement('div', { },
    React.createElement('div', { className: "row"},
      React.createElement(Square, { value: props.squares[0], onClick: () => props.onClick(0) }),
      React.createElement(Square, { value: props.squares[1], onClick: () => props.onClick(1) }),
      React.createElement(Square, { value: props.squares[2], onClick: () => props.onClick(2) }),
    ),
    React.createElement('div', { className: "row"},
      React.createElement(Square, { value: props.squares[3], onClick: () => props.onClick(3) }),
      React.createElement(Square, { value: props.squares[4], onClick: () => props.onClick(4) }),
      React.createElement(Square, { value: props.squares[5], onClick: () => props.onClick(5) }),
    ),
    React.createElement('div', { className: "row"},
      React.createElement(Square, { value: props.squares[6], onClick: () => props.onClick(6) }),
      React.createElement(Square, { value: props.squares[7], onClick: () => props.onClick(7) }),
      React.createElement(Square, { value: props.squares[8], onClick: () => props.onClick(8) }),
    ),
  );
}

export default class Game extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };

  }

   handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

   render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to start';

      return React.createElement('li', {
        key: move,
      }, React.createElement('button', {
        onClick: () => this.jumpTo(move),
        children: desc
      }));
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }
    
    return React.createElement('div', {
      className: 'gage',
    }, React.createElement(Board, {
      squares: current.squares,
      onClick: i => this.handleClick(i),
    }), React.createElement('div', null, status, React.createElement('ol',null, moves)));

  }

}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
