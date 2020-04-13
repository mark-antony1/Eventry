import React from 'react';
import { useStyletron } from 'styletron-react';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import HeaderNavigation from '../components/header-navigation';
import {
  Display4,
  Display2,
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
          <Display2 color="#fff"><b>Find your next team event</b></Display2>
          <Label1 color="#fff"><b>50+ venues in San Francisco</b></Label1>
          <Block marginTop="12px">
            <Button overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#77B900'}}}} $as="a" href="/s">Search venue in San Francisco</Button>
          </Block>
        </Block>
      </Block>
    </Block>
  );
}
