import React, { useEffect, useState } from "react";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem
} from 'baseui/header-navigation';
import DownIcon from 'baseui/icon/chevron-down';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Drawer } from 'baseui/drawer';
import { Label1 } from 'baseui/typography';
import { useStyletron } from 'baseui';
import {
  useQuery
} from '@apollo/react-hooks';

import {
  GET_USER_BY_AUTH,
  GET_ALERT_MESSAGE
} from '../constants/query';
import { useWindowSize } from '../utils';

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

const COLLAPSE_MODE_LIMIT = 800;
export default ({ leftButtons, children }) => {
  const windowSize = useWindowSize();
  const [ showDrawer, setShowDrawer ] = useState(false);
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);
  const [css] = useStyletron();

  const renderDrawer = () => {
    return (
      <Drawer
        onClose={() => { setShowDrawer(false) }}
        isOpen={showDrawer}
        anchor="top"
      >
        <Block display="flex" flexDirection="column" height="100%">
          <Button $as="a" href="/" kind="minimal">
            Home
          </Button>
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
          <Button $as="a" href="/about" kind="minimal">
            About
          </Button>
        </Block>
      </Drawer>
    );
  };
  const renderLogo = () => {
    if (windowSize.width < COLLAPSE_MODE_LIMIT) {
      return (
        <StyledNavigationItem>
          <a href="#" onClick={() => { setShowDrawer(true) }}>
            <Block display="flex" flexDirection="column" alignItems="center">
              <img height="30px" alt="logo" src={process.env.PUBLIC_URL + '/logo.png'} />
              <DownIcon size={18} />
            </Block>
          </a>
        </StyledNavigationItem>
      );
    }
    return (
      <StyledNavigationItem>
        <a href="/">
          <img height="48px" alt="logo" src={process.env.PUBLIC_URL + '/logo.png'} />
        </a>
      </StyledNavigationItem>
    );
  };
  const renderNavRightButton = () => {
    if (windowSize.width < COLLAPSE_MODE_LIMIT) {
      return null;
    }
    return (
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
    );
  };
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
        {renderLogo()}

        <StyledNavigationItem>
          {children}
        </StyledNavigationItem>
      </StyledNavigationList>
      <StyledNavigationList $align={ALIGN.center}>
      </StyledNavigationList>
      {renderNavRightButton()}
      {renderDrawer()}
    </HeaderNavigation>
  );
}
