import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from 'react-router-dom';
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
  useQuery,
  useApolloClient
} from '@apollo/react-hooks';

import {
  GET_USER_BY_AUTH,
  GET_ALERT_MESSAGE,
  GET_EVENTS_BY_AUTH
} from '../constants/query';
import PillButton from '../components/pill-button';
import { venues } from '../constants/locations';
import { useWindowSize, setCookie, showAlert } from '../utils';

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
    <Block position="fixed" className={css({ zIndex: 5, left: '50%', transform: 'translateX(-50%)'})}>
      {
        showAlert ?
        <Block padding="12px" backgroundColor="rgb(119, 185, 0)" className={css({ borderRadius: '10px' })}>
          <span style={{ color: '#fff'}}>{data && data.successAlert}</span>
        </Block> :
        null
      }
    </Block>
  )
}

const COLLAPSE_MODE_LIMIT = 800;
export default ({ leftButtons, children }) => {
  const client = useApolloClient();
  const history = useHistory();
  const location = useLocation();
  const windowSize = useWindowSize();
  const [ showDrawer, setShowDrawer ] = useState(false);
  const { data, loading, error, refetch } = useQuery(GET_USER_BY_AUTH);
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
            (!loading && !error && data && data.user) &&
            <Block padding="12px">
              <PillButton $as="a" href="/feed">
                {data.user.business_name}
              </PillButton>
            </Block>
          }
          {
            (!loading && !error && data && data.user) &&
            <Block padding="12px">
              <PillButton kind="secondary" onClick={async () => {
                setCookie('userToken', '', 7);
                await refetch();
                showAlert(client, 'See you next time!');
                history.push('/');
              }}>
                Sign out
              </PillButton>
            </Block>
          }
          {
            (!loading && !error && !data.user) &&
            <Block padding="12px">
              <PillButton $as="a" href="/signin">
                Sign in
              </PillButton>
            </Block>
          }
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
      <StyledNavigationList $align={ALIGN.right} className={css({paddingRight: '12px !important'})}>
        <StyledNavigationItem>
          <Block>
            <PillButton $as="a" href="/about">
              About
            </PillButton>
          </Block>
        </StyledNavigationItem>
        {
          (!loading && !error && data && data.user) &&
          <StyledNavigationItem>
            <PillButton $as="a" href="/feed">
              {data.user.business_name}
            </PillButton>
          </StyledNavigationItem>
        }
        {
          (!loading && !error && data && data.user) &&
          <StyledNavigationItem>
            <PillButton kind="secondary" onClick={async () => {
              setCookie('userToken', '', 7);
              await refetch();
              showAlert(client, 'See you next time!');
              history.push('/');
            }}>
              Sign out
            </PillButton>
          </StyledNavigationItem>
        }
        {
          (!loading && !error && !data.user) &&
          <StyledNavigationItem>
            <PillButton $as="a" href="/signin">
              Sign in
            </PillButton>
          </StyledNavigationItem>
        }
      </StyledNavigationList>
    );
  };
  return (
    <HeaderNavigation overrides={{ Root: { style: {border: 'none', position: 'relative'} } }}>
      <Alert />
      <StyledNavigationList $align={ALIGN.left} className={css({paddingRight: '0px !important'})}>
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
