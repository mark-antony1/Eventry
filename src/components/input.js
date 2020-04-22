import React from "react";
import { Input } from 'baseui/input';

export default ({ ...props }) => {
  return (
    <Input
      overrides={{
        InputContainer: {
          style: {
            borderBottomRightRadius: '5px !important',
            borderBottomLeftRadius: '5px !important',
            borderTopLeftRadius: '5px !important',
            borderTopRightRadius: '5px !important'
          }
        },
        Input: {
          style: {
            borderBottomRightRadius: '5px !important',
            borderBottomLeftRadius: '5px !important',
            borderTopLeftRadius: '5px !important',
            borderTopRightRadius: '5px !important',
            backgroundColor: '#fff !important'
          }
        }
      }}
      {...props}
    />
  );
};
