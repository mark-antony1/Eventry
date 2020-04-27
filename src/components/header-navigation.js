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
import CreateEventSelectTeamModal from './team/create-event-team-select-modal';
import { useStyletron } from 'baseui';
import {
  useQuery
} from '@apollo/react-hooks';

import {
  GET_USER_BY_AUTH,
  GET_ALERT_MESSAGE,
  GET_EVENTS_BY_AUTH
} from '../constants/query';
import PillButton from '../components/pill-button';
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
        <PillButton $as="a" href={`/${symbol}/dashboard`}>
          {userVenue.name}
        </PillButton>
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
    <PillButton $as="a" href={`/${symbol}/dashboard`}>
      {userVenue.name}
    </PillButton>
  );
};

const ToEvent = () => {
  const [ showModal, setShowModal ] = useState(false);
  const { data, loading, error } = useQuery(GET_EVENTS_BY_AUTH);
  if (loading || error) {
    return null;
  }

  const {
    getEventsByAuth: events
  } = data;

  return (
    <StyledNavigationItem>
      <Block>
        <StatefulPopover
          dismissOnEsc={false}
          content={() => {
            return (
              <Block display="flex" backgroundColor="#fff" flexDirection="column">
                {
                  events.map((e) => {
                    return (
                      <Button kind="minimal" key={e.id} $as="a" href={`/event/${e.id}`}>
                        {e.name}
                      </Button>
                    );
                  })
                }
                <Button kind="minimal" onClick={() => setShowModal(true)}>
                  <span style={{ color: '#4284F2' }}>Create New Event</span>
                </Button>
              </Block>
            );
          }}
          placement="bottomRight"
        >
          <PillButton>
            My Events <DownIcon />
          </PillButton>
        </StatefulPopover>
      </Block>
      <CreateEventSelectTeamModal showModal={showModal} close={() => setShowModal(false)} />
    </StyledNavigationItem>
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
        <Block display="flex">
          <Block padding="12px">
            <PillButton $as="a" href="/">
              Home
            </PillButton>
          </Block>
          {
            (!loading && !error && data && !data.getUserByAuth) &&
            <Block padding="12px">
              <PillButton color="#4284F2" $as="a" href="/user?p=signup">
                Create Event
              </PillButton>
            </Block>
          }
          {
            (!loading && !error && data && data.getUserByAuth && data.getUserByAuth.user) &&
            <Block padding="12px">
              <PillButton $as="a" href="/user">
                {data.getUserByAuth.user.firstName}
              </PillButton>
            </Block>
          }
          <ToVenueDashboardReduced />
          <Block padding="12px">
            <PillButton $as="a" href="/about">
              About
            </PillButton>
          </Block>
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
            <PillButton $as="a" href="/about">
              About
            </PillButton>
          </Block>
        </StyledNavigationItem>
        {
          (!loading && !error && data && !data.getUserByAuth) &&
          <StyledNavigationItem>
            <PillButton color="#4284F2" $as="a" href="/user?p=signup">
              Create Event
            </PillButton>
          </StyledNavigationItem>
        }
        {
          (!loading && !error && data && data.getUserByAuth && data.getUserByAuth.user) &&
          <StyledNavigationItem>
            <PillButton $as="a" href="/user">
              {data.getUserByAuth.user.firstName}
            </PillButton>
          </StyledNavigationItem>
        }
        <ToVenueDashboard />
        <ToEvent />
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
