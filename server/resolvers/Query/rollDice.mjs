/**
 *
 *
 *
 *
 *
 *
 *
 */

export default (root, args, context, info) => {
  let output = [];
  const {numDice, numSides} = args;

  for (let i = 0; i < numDice; i++) {
    output.push(1 + Math.floor(Math.random() * (numSides || 6)));
  }

  return output;
}

