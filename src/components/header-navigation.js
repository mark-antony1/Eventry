import React, { useState, useEffect } from "react";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem
} from "baseui/header-navigation";
import { useStyletron } from 'baseui';
import { Button } from "baseui/button";
import { Block } from 'baseui/block';
import ChevronLeft from 'baseui/icon/chevron-left';
export default ({ leftButtons, children }) => {
  const [css] = useStyletron();

  return (
    <HeaderNavigation overrides={{ Root: { style: {padding:'0px', border: 'none', position: 'relative'} } }}>
      <StyledNavigationList $align={ALIGN.left}>
        {leftButtons ? leftButtons.map((LB, index) => {
          return (
            <StyledNavigationItem key={index} className={css({paddingLeft: '0px !important'})}>
              <LB />
            </StyledNavigationItem>
          );
        }) : null}
      </StyledNavigationList>
      <StyledNavigationList $align={ALIGN.left}>
        <StyledNavigationItem>
            <a href="/">
              <img height="55px" src={process.env.PUBLIC_URL + '/logo.png'} />
            </a>
        </StyledNavigationItem>
        <StyledNavigationItem>
          {children}
        </StyledNavigationItem>
      </StyledNavigationList>
    </HeaderNavigation>
  );
}
