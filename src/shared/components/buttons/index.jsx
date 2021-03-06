/**
 * The new standard button component to be used all around.
 *
 * This module defines a standard button, which is rendered as a standard HTML
 * <button> element, either as react-router <Link>, or as HTML <a>, depending on
 * the props passed in.
 *
 * The button uses react-css-themr for styling, and it is exported mupltiple
 * times, differently wrapped with react-css-themr decorator. The intent behind
 * it is to provide a standard button implementation, which can be easily styled
 * according to the context of use. E.g. in new pages of the main Topcoder site
 * the design assumes that primary buttons are colored with the colors of
 * competition track to which the page relates. react-css-themr allows to
 * wrap entire page into ThemeProvider which overrides the styling of all
 * PrimaryButton instances in the page; it still allows to further customise
 * each of these buttons passing theme object directly into each button
 * (the theme passed this way is merged with the one provided by ThemeProvider).
 * Standard button themes are provided as separate SCSS stylesheets along with
 * this JSX file.
 * 
 * Decision between <button>, <Link>, and <a> is done in the following way:
 *
 * 1. If "to" prop is passed into button, then either <Link> or <a> is used,
 *    according with the rules established in "utils/router" (basically, <Link>
 *    is used for links within the same domain, assuming we are not leaving the
 *    app, and do not want to reload it, <a> is used otherwise; also <a> can be
 *    enforced by "enforceA" and "openNewTab" props);
 * 
 * 2. Otherwise <button> is used.
 * 
 * NOTE: As our <Link> implementation is, technically, a container, Button
 * needs access to Redux store. It is automatically handled behind the scene
 * in the main code, though in the snapshot tests you should take care about
 * providing a mock Redux store to a ReactJS sub-tree containing these buttons.
 *
 * NOTE: Such link-related properties as "enforceA", "openNewTab", and "replace"
 * take no effect when the button is rendered as <button> (i.e. when "to" prop
 * is not provided).
 */

import PT from 'prop-types';
import React from 'react';
import { themr } from 'react-css-themr';
import { Link } from 'utils/router';

import dangerButton from './danger.scss';
import defaultButton from './default.scss';
import primaryDesignButton from './primaryDesign.scss';
import secondaryButton from './secondary.scss';

/* Generic button, not wrapped by themr, but accepting theme property.
 * In most cases you will want to use some of the themable exports below
 * instead. */
function GenericButton({
  children,
  disabled,
  enforceA,
  onClick,
  openNewTab,
  replace,
  theme,
  to,
}) {
  if (disabled) {
    return (
      <span className={`${theme.button} ${theme.disabled}`}>{children}</span>
    );
  } else if (to) {
    return (
      <Link
        className={`${theme.button} ${theme.link}`}
        enforceA={enforceA}
        onClick={onClick}
        openNewTab={openNewTab}
        replace={replace}
        to={to}
      >{children}</Link>
    );
  }
  return (
    <button
      className={`${theme.button} ${theme.regular}`}
      onClick={onClick}
    >{children}</button>
  );
}

GenericButton.defaultProps = {
  children: null,
  disabled: false,
  enforceA: false,
  onClick: null,
  openNewTab: false,
  replace: false,
  to: null,
};

GenericButton.propTypes = {
  children: PT.node,
  disabled: PT.bool,
  enforceA: PT.bool,
  onClick: PT.func,
  openNewTab: PT.bool,
  replace: PT.bool,
  theme: PT.shape({
    button: PT.string.isRequired,
    disabled: PT.string.isRequired,
    link: PT.string.isRequired,
    regular: PT.string.isRequired,
  }).isRequired,
  to: PT.oneOfType([PT.object, PT.string]),
};

export const Button =
  themr('DefaultButton', defaultButton)(GenericButton);

export const DangerButton =
  themr('DangerButton', dangerButton)(GenericButton);

export const PrimaryButton =
  themr('PrimaryButton', primaryDesignButton)(GenericButton);

export const SecondaryButton =
  themr('SecondaryButton', secondaryButton)(GenericButton);

export default undefined;
