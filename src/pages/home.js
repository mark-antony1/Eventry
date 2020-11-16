import React from 'react';
import { useStyletron } from 'styletron-react';
import { Tag } from 'baseui/tag';
import { Block } from 'baseui/block';
import HeaderNavigation from '../components/header-navigation';
import Button from '../components/button';
import PillButton from '../components/pill-button';
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
          height="calc(100vh - 300px)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Display2 color="#fff"><b>Stand Out In This Crazy Internet Era</b></Display2>
          <Label1 color="#fff"><b></b></Label1>
          <Block display="flex" width={['100%', '100%', 'fit-content', 'fit-content']} flexDirection={['column', 'column', 'row', 'row']}>

          </Block>
        </Block>
      </Block>
      <Block backgroundColor="#f7f7f7" padding="48px" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Label1 color="#484848" $as="a" href="/privacy"><b>Privacy Policy</b></Label1>
      </Block>
    </Block>
  );
}

// <Block display="flex" flexDirection="column" padding="48px" marginTop="68px">
//   <Block display="flex" alignItems="center">
//     <Block width="20px" height="20px" backgroundColor="#D44333" marginRight="8px" />
//     <Tag closeable={false} variant="outlined" kind="negative">New</Tag>
//   </Block>
//   <Display2><b>Keep The Team Together</b></Display2>
//   <Display4><b>Build relationships and hangout with the team <span style={{ color: '#FF9D15'}}>virtually</span></b></Display4>
//   <Block marginTop="12px">
//     <Button $as="a" href="/v" overrides={{ BaseButton: { style: { height: '34px'}}}} backgroundColor="#FF9D15" color="#fff">
//       <p style={{fontSize: "18px"}}>Search Virtual</p>
//     </Button>
//   </Block>
// </Block>
// <Block display="flex" flexWrap="wrap" padding="48px" marginTop="68px" marginBottom="68px">
//   <Block flex="0 1 100%" display="flex" alignItems="center">
//     <Block width="20px" height="20px" backgroundColor="#77B900" marginRight="12px" />
//     <Label3><b>Get Started</b></Label3>
//   </Block>
//   <Block flex="0 1 100%">
//     <Display2><b>Search for Events</b></Display2>
//     <Label1><b>Browse a selection of the best curated experiences for teambuilding and hanging out.</b></Label1>
//     <Label1><b>Whether you want to find some in person or virtual, we have a selection that your entire team will love.</b></Label1>
//   </Block>
//   <Block display="flex" display={['none', 'none', 'initial', 'initial']} justifyContent="center" marginTop="24px">
//     <img width="80%" src={process.env.PUBLIC_URL + './search.png'} />
//   </Block>
// </Block>
// <Block display="flex" flexWrap="wrap" padding="48px" marginTop="68px" marginBottom="68px">
//   <Block flex="0 1 100%" display="flex" alignItems="center">
//     <Block width="20px" height="20px" backgroundColor="#4284F2" marginRight="12px" />
//   </Block>
//   <Block flex="0 1 100%">
//     <Display2><b>Manage Your Team</b></Display2>
//   </Block>
//   <Block flex="0 1 50%" marginTop="12px">
//     <Block paddingRight="12px">
//       <Display4 color="#4284F2"><b>01</b></Display4>
//       <Label1><b>Create or Join your team</b></Label1>
//     </Block>
//   </Block>
//   <Block flex="0 1 50%" marginTop="12px">
//     <Block paddingRight="12px">
//       <Display4 color="#4284F2"><b>02</b></Display4>
//       <Label1><b>Create or Select your team's event</b></Label1>
//     </Block>
//   </Block>
//   <Block flex="0 1 50%" marginTop="12px">
//     <Block paddingRight="12px">
//       <Display4 color="#4284F2"><b>03</b></Display4>
//       <Label1><b>Vote on a poll</b></Label1>
//     </Block>
//   </Block>
//   <Block flex="0 1 50%" marginTop="12px">
//     <Block paddingRight="12px">
//       <Display4 color="#4284F2"><b>04</b></Display4>
//       <Label1><b>Choose your event and book</b></Label1>
//     </Block>
//   </Block>
//   <Block flex="0 1 100%" marginTop="12px">
//     <Button $as="a" href="/user?p=signup" overrides={{ BaseButton: { style: { height: '34px'}}}} backgroundColor="#4284F2" color="#fff">
//       <p style={{fontSize: "18px"}}>Start Team Event</p>
//     </Button>
//   </Block>
// </Block>
