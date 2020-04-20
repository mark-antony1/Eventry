import React from "react";
import { Textarea } from 'baseui/textarea';

export default ({ ...props }) => {
  return (
    <Textarea
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
