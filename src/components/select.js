import React from "react";
import { Select } from 'baseui/select';
import { useStyletron } from 'styletron-react';

export default ({ ...props }) => {
  return (
    <Select
      overrides={{
        ControlContainer: {
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
