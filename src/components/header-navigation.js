import React from "react";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem
} from "baseui/header-navigation";
import { Block } from "baseui/block";
import { Button } from "baseui/button";
import { useStyletron } from 'baseui';
import {
  useQuery
} from '@apollo/react-hooks';

import {
  GET_USER_BY_AUTH
} from '../constants/query';

export default ({ leftButtons, children }) => {
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);
  const [css] = useStyletron();

  return (
    <HeaderNavigation overrides={{ Root: { style: {border: 'none', position: 'relative'} } }}>
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
              <img height="48px" alt="logo" src={process.env.PUBLIC_URL + '/logo.png'} />
            </a>
        </StyledNavigationItem>
        <StyledNavigationItem>
          {children}
        </StyledNavigationItem>
      </StyledNavigationList>
      <StyledNavigationList $align={ALIGN.center}>
      </StyledNavigationList>
      <StyledNavigationList $align={ALIGN.right}>
        <StyledNavigationItem>
          <Block>
            <Button $as="a" href="/about" kind="minimal">
              About
            </Button>
          </Block>
        </StyledNavigationItem>
        <StyledNavigationItem>
          <Block marginRight="24px">
            {
              (!loading && !data.getUserByAuth) &&
              <Button $as="a" href="/user" kind="minimal">
                Sign up
              </Button>
            }
            {
              (!loading && data.getUserByAuth) &&
              <Button $as="a" href="/user" kind="minimal">
                {data.getUserByAuth.user.firstName}
              </Button>
            }
          </Block>
        </StyledNavigationItem>
      </StyledNavigationList>
    </HeaderNavigation>
  );
}
