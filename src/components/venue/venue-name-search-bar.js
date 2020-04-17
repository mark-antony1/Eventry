import React, { useState } from 'react';
import {
  Display4,
  Label1,
  Label2,
  Label3,
} from 'baseui/typography';
import { Select } from 'baseui/select';
import { Block } from 'baseui/block';
import { venues as allVenues } from '../../constants/locations';
import { venues as allVirtualVenues } from '../../constants/virtual-locations';
const allLocations = [ ...allVenues, ...allVirtualVenues ];

const getLabel = ({option}) => {
  return (
    <Block>
      <Label2>{option.label}</Label2>
      <Label3>{option.teaserDescription}</Label3>
    </Block>
  );
};

export default function VenueNameSearchBar({ updateForm, form }) {
  const [ searchKey, setSearchKey ] = useState('');
  const searchResults = allLocations.filter((loc) => {
    return loc.name.toLowerCase().includes(searchKey.toLowerCase());
  }).slice(0, 3);

  return (
    <Select
      options={searchResults.map(result => ({
        label: result.name,
        id: result.symbol,
        teaserDescription: result.teaserDescription
      }))}
      placeholder="Search venue by name"
      onInputChange={(event) => setSearchKey(event.target.value)}
      value={form.venue ? [form.venue] : null}
      onChange={params => updateForm({ venue: params.value[0] })}
      getOptionLabel={getLabel}
    />
  );
}
