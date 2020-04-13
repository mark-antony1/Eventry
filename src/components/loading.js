import React from 'react';
import { Block } from 'baseui/block';
import { Label1 } from 'baseui/typography';
import { StyledSpinnerNext } from 'baseui/spinner';
import { withStyle } from 'baseui';

const Spinner = withStyle(StyledSpinnerNext, {
  borderTopColor: '#000',
});

export default function Loading({ compact, message }) {
  if (compact) {
    return (
      <Block
        position="absolute"
        top="0px"
        left="0px"
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        zindex="10"
        backgroundColor="#fff"
      >
        <Spinner />
        {message && <Label1><b>{message}</b></Label1>}
      </Block>
    );
  }
  return (
    <Block
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      height="calc(100vh - 80px)"
    >
      <Spinner />
      {message && <Label1><b>{message}</b></Label1>}
    </Block>
  );
}
