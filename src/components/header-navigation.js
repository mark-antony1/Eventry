import React, { useState, useEffect } from "react";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem
} from "baseui/header-navigation";
import { useStyletron } from 'baseui';
import { Button } from "baseui/button";
import ChevronLeft from 'baseui/icon/chevron-left';
export default ({ match }) => {
  const [css] = useStyletron();
  const NavButtons = () => {
    const buttoms = [];
    if (match.params.venueSymbol) {
      buttoms.push(
        <StyledNavigationItem key="back-button" className={css({paddingLeft: '0px !important'})}>
          <Button kind="secondary" overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#77B900'}}}} $as="a" href="/">
            <ChevronLeft /> Map
          </Button>
        </StyledNavigationItem>
      );
    }
    return buttoms;
  };
  return (
    <HeaderNavigation overrides={{ Root: { style: {padding:'0px', border: 'none'} } }}>
      <StyledNavigationList $align={ALIGN.left}>
        {NavButtons()}
        <StyledNavigationItem>
          <Button kind="minimal" $as="a" href="/">
            Teambright
          </Button>
        </StyledNavigationItem>
      </StyledNavigationList>
    </HeaderNavigation>
  );
}
