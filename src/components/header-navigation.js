import React, { useEffect, useState } from "react";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem
} from 'baseui/header-navigation';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Label1 } from 'baseui/typography';
import { useStyletron } from 'baseui';
import ReactGA from "react-ga";
import {
  useQuery
} from '@apollo/react-hooks';

import {
  GET_USER_BY_AUTH,
  GET_ALERT_MESSAGE
} from '../constants/query';

ReactGA.initialize(process.env.REACT_APP_GA_ID);
const Alert = () => {
  const { data } = useQuery(GET_ALERT_MESSAGE);
  const [ showAlert, setShowAlert ] = useState(false);

  useEffect(() => {
    if (data && data.successAlert) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 4000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ data && data.successAlert ]);

  return (
    <Block position="fixed" top="15px" left="15px">
      {
        showAlert ?
        <Block padding="12px" backgroundColor="rgb(119, 185, 0)">
          <Label1 color="#fff"><b>{data && data.successAlert}</b></Label1>
        </Block> :
        null
      }
    </Block>
  )
}
export default ({ leftButtons, children }) => {
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);
  const [css] = useStyletron();

  useEffect(() => {
    if (data && data.getUserByAuth && data.getUserByAuth.user && data.getUserByAuth.user.id) {
      console.log(data.getUserByAuth.user.id, process.env.REACT_APP_GA_ID)
      ReactGA.set({ userId: data.getUserByAuth.user.id });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [data && data.getUserByAuth && data.getUserByAuth.user && data.getUserByAuth.user.id]);

  return (
    <HeaderNavigation overrides={{ Root: { style: {border: 'none', position: 'relative'} } }}>
      <Alert />
      <StyledNavigationList $align={ALIGN.left}>
        {leftButtons ? leftButtons.map((LB, index) => {
          return (
            <StyledNavigationItem key={index} className={css({paddingLeft: '0px !important'})}>
              <LB />
            </StyledNavigationItem>
          );
        }) : null}
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
              (!loading && !error && data && !data.getUserByAuth) &&
              <Button $as="a" href="/user" kind="minimal">
                Sign up
              </Button>
            }
            {
              (!loading && !error && data && data.getUserByAuth && data.getUserByAuth.user) &&
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
