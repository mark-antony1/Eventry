import React from "react";
import { Input } from 'baseui/input';

export default ({ ...props }) => {
  return (
    <Input
      overrides={{
        InputContainer: {
          style: {
            borderRadius: '5px !important'
          }
        },
        Input: {
          style: {
            borderRadius: '5px !important',
            backgroundColor: '#fff !important'
          }
        }
      }}
      {...props}
    />
  );
};
