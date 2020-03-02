import React, { useState } from 'react';
import { Block } from 'baseui/block';
import DiscoveryMap from '../components/map/discovery-map';
import VenueCell from '../components/venue/venue-cell';
import { venues as allVenues } from '../constants/locations';

// Filter
import { Radio, RadioGroup } from 'baseui/radio';
import { Select } from 'baseui/select';

const typeOptions = [
  {
    id: 'athletic',
    label: 'Athletic'
  },
  {
    id: 'game',
    label: 'Game'
  },
  {
    id: 'lunch',
    label: 'Lunch'
  },
];

const durationOptions = [
  {
    id: 1,
    label: '1 hour or less'
  },
  {
    id: 2,
    label: '1 hour - 3 hours'
  },
  {
    id: 3,
    label: '3+ hours'
  }
];

function Filter({ filterValue, updateFilterValue }) {

  const groupSizeOptions = [];
  for (let i = 2; i <= 50; i++) {
    groupSizeOptions.push({
      id: i,
      label: i
    });
  }

  return (
    <Block display="flex" alignItems="center" flexWrap="wrap">
      <Block width="150px" padding="12px">
        <Select
          options={groupSizeOptions}
          value={filterValue.recommendedGroupsize ? {id: filterValue.recommendedGroupsize} : null}
          placeholder="Group Size"
          onChange={params => updateFilterValue({ recommendedGroupsize: params.value[0].id })}
        />
      </Block>
      <Block width="150px" padding="12px">
        <Select
          options={typeOptions}
          value={filterValue.type ? {id: filterValue.type} : null}
          placeholder="Activity Type"
          onChange={params => updateFilterValue({ type: params.value[0].id })}
        />
      </Block>
      <Block padding="12px">
        <RadioGroup
          align="horizontal"
          name="horizontal"
          onChange={e => updateFilterValue({ price: e.target.value })}
          value={filterValue.price}
        >
          <Radio value="$">$</Radio>
          <Radio value="$$">$$</Radio>
          <Radio value="$$$">$$$</Radio>
          <Radio value="$$$$">$$$$</Radio>
        </RadioGroup>
      </Block>
      <Block width="200px" padding="12px">
        <Select
          options={durationOptions}
          value={filterValue.duration ? {id: filterValue.duration} : null}
          placeholder="Preferred Duration"
          onChange={params => updateFilterValue({ duration: params.value[0].id })}
        />
      </Block>
      <Block padding="12px">
        <RadioGroup
          align="horizontal"
          name="horizontal"
          onChange={e => updateFilterValue({ place: e.target.value })}
          value={filterValue.place}
        >
          <Radio value="indoor">Indoor</Radio>
          <Radio value="outdoor">Outdoor</Radio>
        </RadioGroup>
      </Block>
    </Block>
  );
}

function filterVenues(venues, filterValue) {
  return venues.filter(venue => {
    if (filterValue.price && venue.price !== filterValue.price) {
      return false;
    }
    if (filterValue.recommendedGroupsize && (venue.recommendedGroupsize[0] > filterValue.recommendedGroupsize || venue.recommendedGroupsize[1] < filterValue.recommendedGroupsize)) {
      return false;
    }
    if (filterValue.duration) {
      // 1 hour or less
      if (filterValue.duration === 1 && venue.averageTimeSpent > 60) {
        return false;
      }
      // 1 - 3
      if (filterValue.duration === 2 && (venue.averageTimeSpent < 60 || venue.averageTimeSpent > 180)) {
        return false;
      }
      // 3+
      if (filterValue.duration === 3 && venue.averageTimeSpent < 180) {
        return false;
      }
    }
    if (filterValue.type && venue.tags.indexOf(filterValue.type) === -1) {
      return false;
    }
    if (filterValue.place && filterValue.place !== venue.place) {
      return false;
    }
    return true;
  });
}

export default function Discovery() {
  const [ venues, setVenues ] = useState(allVenues);
  const [ hoveredVenueId , setHoveredVenueId ] = useState(null);
  const [ filterValue , setFilterValue ] = useState({
    price: null,
    recommendedGroupsize: null,
    duration: null,
    type: null,
    place: null
  });
  const updateFilterValue = (payload) => {
    setFilterValue({
      ...filterValue,
      ...payload
    });
    setVenues(filterVenues(allVenues, {
      ...filterValue,
      ...payload
    }));
  };
  return (
    <Block display="flex" flexDirection="column" height="calc(100vh - 49px)">
      <Block>
        <Filter filterValue={filterValue} updateFilterValue={updateFilterValue} />
      </Block>
      <Block display="flex" flexDirection={["column", "column", "row", "row"]} flex="1 1 auto" overflow={["initial", "initial", "auto", "auto"]}>
        <Block flex="4">
          <DiscoveryMap venues={venues} hoveredVenueId={hoveredVenueId} />
        </Block>
        <Block flex="5" display="flex" flexDirection="column" overflow="auto">
          {
            venues.map((venue, index) => {
              return (
                <Block
                  key={`cell-${index}`}
                  overrides={{
                    Block: {
                      style: {
                        opacity: hoveredVenueId === venue.id ? 0.8 : 1,
                        cursor: 'pointer'
                      }
                    }
                  }}
                  onMouseLeave={() => { setHoveredVenueId(null) }}
                  onMouseEnter={() => { setHoveredVenueId(venue.id) }}
                >
                  <VenueCell venue={venue} />
                </Block>
              );
            })
          }
        </Block>
      </Block>
    </Block>
  );
}
