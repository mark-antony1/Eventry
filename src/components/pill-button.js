import React from "react";
import { Button } from 'baseui/button';
import { Label3 } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { useStyletron } from 'styletron-react';

export default React.forwardRef(({ color, kind, loading, children, ...props }, ref) => {
  const [ css ] = useStyletron();
  const { disabled } = props;
  const getBorder = () => {
    if (kind === 'minimal') {
      return '1px solid transparent !important';
    }
    return '1px solid #ebebeb !important';
  };

  const getBoxShadow = () => {
    if (kind === 'minimal') {
      return 'none';
    }
    return '0px 1px 2px rgba(0, 0, 0, 0.18) !important';
  };

  const getBackgroundColor = () => {
    if (disabled) {
      return '#f4f4f4';
    }
    if (kind === 'minimal') {
      return 'transparent !important';
    }
    return '#fff !important';
  };

  const getColor = () => {
    if (disabled) {
      return '#777';
    }

    if (color) {
      return color;
    }
    return '#000';
  };
  return (
    <Button
      className={css({
        boxShadow: getBoxShadow(),
        borderRadius: '500px !important',
        border: getBorder(),
        backgroundColor: getBackgroundColor(),
        ':hover': {
          backgroundColor: !disabled ? '#f4f4f4 !important' : '#f4f4f4'
        }
      })}
      overrides={{
        BaseButton: {
          props: {ref: ref, ...props},
        },
      }}
      kind={kind}
      disabled={disabled || loading}
      {...props}
    >
      <Label3
        className={css({
          display: 'flex',
          alignItems: 'center',
          color: getColor()
        })}
      >
        {loading && <Spinner size="16px" color="#000" />}
        {!loading && children}
      </Label3>
    </Button>
  );
});
