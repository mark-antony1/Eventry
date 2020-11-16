import React from "react";
import { Textarea } from 'baseui/textarea';

export default ({ ...props }) => {
  return (
    <Textarea
      overrides={{
        InputContainer: {
          style: {
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            borderBottomLeftRadius: '5px',
            borderBottomRightRadius: '5px',
          }
        },
        Input: {
          style: {
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            borderBottomLeftRadius: '5px',
            borderBottomRightRadius: '5px',
            backgroundColor: '#fff !important'
          }
        }
      }}
      {...props}
    />
  );
};
