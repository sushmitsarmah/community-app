/**
 * Renders prize component of the challenge scorecard.
 * It has no logic related to currency conversion etc., it just takes three
 * props (number,)
 */

import PT from 'prop-types';
import React from 'react';
import Tip from './Tip';
import Tooltip from '../../Tooltips/Tooltip';
import './style.scss';

export default function Prize({
  bonuses,
  label,
  prizes,
  prizeUnitSymbol,
  totalPrize,
  withoutTooltip,
}) {
  const component = (
    <div>
      <div styleName="prize">
        <span styleName="symbol">{prizeUnitSymbol}</span>
        {totalPrize.toLocaleString()}
      </div>
      <div styleName="label">{label}</div>
    </div>
  );
  if (withoutTooltip) return component;
  const tip = (
    <Tip
      bonuses={bonuses}
      prizes={prizes}
      prizeUnitSymbol={prizeUnitSymbol}
    />
  );
  return <Tooltip content={tip}>{component}</Tooltip>;
}

Prize.defaultProps = {
  prizes: [],
  withoutTooltip: false,
};

Prize.propTypes = {
  bonuses: PT.arrayOf(PT.object).isRequired,
  label: PT.string.isRequired,
  prizes: PT.arrayOf(PT.number),
  prizeUnitSymbol: PT.string.isRequired,
  totalPrize: PT.number.isRequired,
  withoutTooltip: PT.bool,
};
