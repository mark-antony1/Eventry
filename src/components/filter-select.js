import React, { useState, useEffect } from "react";
import { StatefulPopover } from 'baseui/popover';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Label3 } from 'baseui/typography';
import { useStyletron } from 'styletron-react';

export default ({ value, options, placeholder, onChange }) => {
  const [ css ] = useStyletron();
  const [ selected, setSelected ] = useState(Boolean(value));

  useEffect(() => {
    setSelected(value !== 'none' && Boolean(value));
  }, [value])

  return (
    <Block width="fit-content">
      <StatefulPopover
        dismissOnEsc={false}
        overrides={{
          Body: {
            style: {
              zIndex: 10
            }
          }
        }}
        content={({close}) => {
          return (
            <Block display="flex" flexDirection="column">
              {
                options.map((option) => {
                  return (
                    <Button key={option.id} onClick={() => {
                      onChange(option);
                      close();
                    }}>
                      {option.label}
                    </Button>
                  );
                })
              }
            </Block>
          );
        }}
        onMouseLeave={() => setSelected(false)}
        onMouseEnter={() => setSelected(true)}
        placement="bottom"
      >
        <Block
          className={css({
            borderRadius: '500px',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.18) !important',
            border: selected ? '1px solid #000' : '1px solid #ddd',
            padding: '16px'
          })}
        >
          <Label3>{value ? options.find(o => o.id === value).label : placeholder}</Label3>
        </Block>
      </StatefulPopover>
    </Block>
  );
};
