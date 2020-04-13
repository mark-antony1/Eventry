import React from 'react';
import { useStyletron } from 'styletron-react';
import { Tag } from 'baseui/tag';
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
          <Block display="flex">
            <Block margin="12px">
              <Button kind="secondary" $as="a" href="/v">
                <Tag closeable={false} variant="outlined" kind="negative">New</Tag> Search virtual events
              </Button>
            </Block>
            <Block margin="12px">
              <Button overrides={{ BaseButton: { style: { color: '#fff', backgroundColor: '#77B900', height: '34px'}}}} $as="a" href="/s">
                Search venues in San Francisco
              </Button>
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  );
}
