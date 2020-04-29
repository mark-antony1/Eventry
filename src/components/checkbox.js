import React from 'react';
import { Checkbox } from 'baseui/checkbox';

export default ({ children, ...props }) => {
  return (
    <Checkbox
      overrides={{
        Checkmark: {
          style: {
            borderBottomRightRadius: '5px !important',
            borderTopRightRadius: '5px !important',
            borderBottomLeftRadius: '5px !important',
            borderTopLeftRadius: '5px !important',
          }
        }
      }}
      {...props}
    >
      {children}
    </Checkbox>
  );
}
