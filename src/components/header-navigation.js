import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem
} from 'baseui/header-navigation';
import DownIcon from 'baseui/icon/chevron-down';
import { StatefulPopover } from 'baseui/popover';
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
import { venues } from '../constants/locations';
import { useWindowSize } from '../utils';

const Alert = () => {
  const [ css ] = useStyletron();
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
    <Block position="fixed" bottom="15px" left="15px" className={css({ zIndex: 5 })}>
      {
        showAlert ?
        <Block padding="12px" backgroundColor="rgb(119, 185, 0)">
          <span style={{ color: '#fff'}}>{data && data.successAlert}</span>
        </Block> :
        null
      }
    </Block>
  )
}

const ToVenueDashboard = () => {
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);
  if (loading || error) {
    return null;
  }

  const {
    getUserByAuth: auth
  } = data;

  if (!auth) {
    return null;
  }

  const {
    user: {
      venue
    }
  } = auth;

  if (!venue) {
    return null;
  }

  const { symbol } = venue;
  const userVenue = venues.find((v) => v.symbol === symbol) || {};

  return (
    <StyledNavigationItem>
      <Block>
        <Button $as="a" href={`/${symbol}/dashboard`} kind="minimal">
          {userVenue.name}
        </Button>
      </Block>
    </StyledNavigationItem>
  );
};

const ToVenueDashboardReduced = () => {
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);
  if (loading || error) {
    return null;
  }

  const {
    getUserByAuth: auth
  } = data;

  if (!auth) {
    return null;
  }

  const {
    user: {
      venue
    }
  } = auth;

  if (!venue) {
    return null;
  }

  const { symbol } = venue;
  const userVenue = venues.find((v) => v.symbol === symbol) || {};

  return (
    <Button $as="a" href={`/${symbol}/dashboard`} kind="minimal">
      {userVenue.name}
    </Button>
  );
};

const ToTeam = () => {
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);
  if (loading || error) {
    return null;
  }

  const {
    getUserByAuth: auth
  } = data;

  if (!auth) {
    return null;
  }

  const {
    user: {
      teams
    }
  } = auth;

  if (!teams || !teams.length) {
    return null;
  }

  return (
    <StyledNavigationItem>
      <Block>
        <StatefulPopover
          dismissOnEsc={false}
          content={() => {
            return (
              <Block display="flex" flexDirection="column">
                {
                  teams.map((team) => {
                    return (
                      <Button key={team.id} $as="a" href={`/team/${team.id}`}>
                        {team.name}
                      </Button>
                    );
                  })
                }
              </Block>
            );
          }}
          placement="bottomRight"
        >
          <Button kind="minimal">
            My Teams <DownIcon />
          </Button>
        </StatefulPopover>
      </Block>
    </StyledNavigationItem>
  );
};

const ToTeamReduced = () => {
  const { data, loading, error } = useQuery(GET_USER_BY_AUTH);
  if (loading || error) {
    return null;
  }

  const {
    getUserByAuth: auth
  } = data;

  if (!auth) {
    return null;
  }

  const {
    user: {
      teams
    }
  } = auth;

  if (!teams || !teams.length) {
    return null;
  }

  return (
    <StatefulPopover
      dismissOnEsc={false}
      content={() => {
        return (
          <Block display="flex" flexDirection="column">
            {
              teams.map((team) => {
                return (
                  <Button key={team.id} $as="a" href={`/team/${team.id}`}>
                    {team.name}
                  </Button>
                );
              })
            }
          </Block>
        );
      }}
      placement="bottomRight"
    >
      <Button kind="minimal">
        My Teams <DownIcon />
      </Button>
    </StatefulPopover>
  );
};

const COLLAPSE_MODE_LIMIT = 800;
export default ({ leftButtons, children }) => {
  const location = useLocation();
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
        overrides={{
          Root: {
            style: {
              zIndex: 2
            }
          }
        }}
      >
        <Block display="flex" flexDirection="column" height="100%">
          <Button $as="a" href="/" kind="minimal">
            Home
          </Button>
          {
            (!loading && !error && data && !data.getUserByAuth) &&
            <Button $as="a" href="/user?p=signup" kind="minimal">
              Sign up
            </Button>
          }
          {
            (!loading && !error && data && !data.getUserByAuth) &&
            <Button $as="a" href="/user" kind="minimal">
              Sign in
            </Button>
          }
          {
            (!loading && !error && data && data.getUserByAuth && data.getUserByAuth.user) &&
            <Button $as="a" href="/user" kind="minimal">
              {data.getUserByAuth.user.firstName}
            </Button>
          }
          <ToVenueDashboardReduced />
          <ToTeamReduced />
          <Button $as="a" href="/about" kind="minimal">
            About
          </Button>
        </Block>
      </Drawer>
    );
  };
  const renderLogo = () => {
    const homePath = location.pathname === '/s' ? '/s' : '/';
    if (windowSize.width < COLLAPSE_MODE_LIMIT) {
      return (
        <StyledNavigationItem>
          <Block
            display="flex"
            flexDirection="column"
            alignItems="center"
            onClick={() => { setShowDrawer(true) }}
            overrides={{
              Block: {
                style: {
                  cursor: 'pointer'
                }
              }
            }}
          >
            <img height="30px" alt="logo" src={process.env.PUBLIC_URL + '/logo.png'} />
            <DownIcon size={18} />
          </Block>
        </StyledNavigationItem>
      );
    }
    return (
      <StyledNavigationItem>
        <a href={homePath}>
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
      <StyledNavigationList $align={ALIGN.right} className={css({paddingRight: '12px !important'})}>
        <StyledNavigationItem>
          <Block>
            <Button $as="a" href="/about" kind="minimal">
              About
            </Button>
          </Block>
        </StyledNavigationItem>
        {
          (!loading && !error && data && !data.getUserByAuth) &&
          <StyledNavigationItem>
            <Button $as="a" href="/user?p=signup" kind="minimal">
              Sign up
            </Button>
          </StyledNavigationItem>
        }
        {
          (!loading && !error && data && !data.getUserByAuth) &&
          <StyledNavigationItem>
            <Button $as="a" href="/user" kind="minimal">
              Sign in
            </Button>
          </StyledNavigationItem>
        }
        {
          (!loading && !error && data && data.getUserByAuth && data.getUserByAuth.user) &&
          <StyledNavigationItem>
            <Button $as="a" href="/user" kind="minimal">
              {data.getUserByAuth.user.firstName}
            </Button>
          </StyledNavigationItem>
        }
        <ToVenueDashboard />
        <ToTeam />
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
