/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import Checkbox from './Checkbox.mjs';

export default function Radio (props) {
  const { type, ...rests } = props;

  return Checkbox({
    type: 'radio',
    ...rests,
  });
}
