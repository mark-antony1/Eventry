import React from "react";
import { Button } from 'baseui/button';
import { Label3 } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { useStyletron } from 'styletron-react';

export default React.forwardRef(({ color, backgroundColor, kind, children, loading, ...props }, ref) => {
  const [ css ] = useStyletron();
  const { disabled } = props;

  const getBorder = () => {
    if (kind === 'minimal' || backgroundColor) {
      return '1px solid transparent !important';
    }
    return '1px solid #777 !important';
  };

  const getBackgroundColor = () => {
    if (backgroundColor) {
      return `${backgroundColor} !important`;
    }
    if (kind === 'minimal') {
      return 'transparent !important';
    }
    return '#fff !important';
  };
  return (
    <Button
      className={css({
        borderRadius: '15px !important',
        border: getBorder(),
        backgroundColor: getBackgroundColor(),
        ':hover': {
          backgroundColor: !backgroundColor ? '#f4f4f4 !important' : '#777 !important',
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
          color: color ? `${color} !important` : '#000'
        })}
      >
        {loading && <Spinner size="16px" color="#000" />}
        {!loading && children}
      </Label3>
    </Button>
  );
});
