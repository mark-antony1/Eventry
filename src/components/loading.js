import React from 'react';
import { Block } from 'baseui/block';
import { StyledSpinnerNext } from 'baseui/spinner';
import { withStyle } from 'baseui';

const Spinner = withStyle(StyledSpinnerNext, {
  borderTopColor: '#000',
});

export default function Loading({ compact }) {
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
        zindex="10"
        backgroundColor="#fff"
      >
        <Spinner />
      </Block>
    );
  }
  return (
    <Block
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="calc(100vh - 80px)"
    >
      <Spinner />
    </Block>
  );
}
