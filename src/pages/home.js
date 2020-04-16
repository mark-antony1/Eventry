import React from 'react';
import { useStyletron } from 'styletron-react';
import { Tag } from 'baseui/tag';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import HeaderNavigation from '../components/header-navigation';
import {
  Display4,
  Display2,
  Label3,
  Label1,
  Paragraph1,
} from 'baseui/typography';

export default function Home() {
  const [ css ] = useStyletron();
  return (
    <Block display="flex" flexDirection="column">
      <HeaderNavigation leftButtons={[]} />
      <Block display="flex" flexDirection="column">
        <Block
          className={css({
            background: 'url("./team.jpeg") no-repeat',
            backgroundSize: 'cover, contain',
          })}
          padding="24px"
          height="calc(100vh - 120px)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Display2 color="#fff"><b>Find Your Next Team Experience</b></Display2>
          <Label1 color="#fff"><b>70+ venues in person and virtually</b></Label1>
          <Block display="flex">
            <Block margin="12px">
              <Button kind="secondary" $as="a" href="/v">
                <Tag closeable={false} variant="outlined" kind="negative">New</Tag> Search Virtual Experiences
              </Button>
            </Block>
            <Block margin="12px">
              <Button overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#77B900', height: '34px'}}}} $as="a" href="/s">
                Search Experiences in San Francisco
              </Button>
            </Block>
          </Block>
        </Block>
      </Block>
      <Block display="flex" flexDirection="column" padding="48px" marginTop="68px">
        <Block display="flex" alignItems="center">
          <Block width="20px" height="20px" backgroundColor="#D44333" marginRight="8px" />
          <Tag closeable={false} variant="outlined" kind="negative">New</Tag>
        </Block>
        <Display2><b>Keep The Team Together</b></Display2>
        <Display4><b>Build relationships and hangout with the team <span style={{ color: '#FF9D15'}}>virtually</span></b></Display4>
        <Block marginTop="12px">
          <Button $as="a" href="/v" overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#FF9D15', height: '34px'}}}}>
            Search Virtual Experiences
          </Button>
        </Block>
      </Block>
      <Block display="flex" flexWrap="wrap" padding="48px" marginTop="68px" marginBottom="68px">
        <Block flex="0 1 100%" display="flex" alignItems="center">
          <Block width="20px" height="20px" backgroundColor="#77B900" marginRight="12px" />
          <Label3><b>Get Started</b></Label3>
        </Block>
        <Block flex="0 1 100%">
          <Display2><b>How it works</b></Display2>
        </Block>
        <Block flex="0 1 50%" marginTop="12px">
          <Block paddingRight="12px">
            <Display4 color="#77B900"><b>01</b></Display4>
            <Label1><b>Choose your area or virtual experiences</b></Label1>
          </Block>
        </Block>
        <Block flex="0 1 50%" marginTop="12px">
          <Block paddingRight="12px">
            <Display4 color="#77B900"><b>02</b></Display4>
            <Label1><b>Browse experiences</b></Label1>
          </Block>
        </Block>
        <Block flex="0 1 50%" marginTop="12px">
          <Block paddingRight="12px">
            <Display4 color="#77B900"><b>03</b></Display4>
            <Label1><b>View experience details</b></Label1>
          </Block>
        </Block>
        <Block flex="0 1 50%" marginTop="12px">
          <Block paddingRight="12px">
            <Display4 color="#77B900"><b>04</b></Display4>
            <Label1><b>Book your team experience!</b></Label1>
          </Block>
        </Block>
      </Block>
      <Block backgroundColor="#f7f7f7" padding="48px" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Label1 color="#77B900"><b>team@teambright.co</b></Label1>
        <Label1 color="#77B900" $as="a" href="/privacy"><b>Privacy Policy</b></Label1>
      </Block>
    </Block>
  );
}
