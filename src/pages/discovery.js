import React, { useState } from 'react';
import { Block } from 'baseui/block';
import { useHistory } from 'react-router-dom';
import { StyledLink } from 'baseui/link';
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

const budgetOptions = [
  {
    id: 1,
    label: '$20 or less'
  },
  {
    id: 2,
    label: '$20 to $50'
  },
  {
    id: 3,
    label: '$50 to $100'
  },
  {
    id: 4,
    label: 'More than $100'
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
    <Block display="flex" alignItems="center" flexWrap="wrap" backgroundColor="#f4f4f4">
      <Block width="150px" padding="12px">
        <Select
          clearable={false}
          overrides={{ ControlContainer: { style: { backgroundColor: '#fff'}} }}
          options={groupSizeOptions}
          value={filterValue.recommendedGroupsize ? [{id: filterValue.recommendedGroupsize}] : null}
          placeholder="Group Size"
          onChange={params => updateFilterValue({ recommendedGroupsize: params.value[0].id })}
        />
      </Block>
      <Block width="150px" padding="12px">
        <Select
          clearable={false}
          overrides={{ ControlContainer: { style: { backgroundColor: '#fff'}} }}
          options={typeOptions}
          value={filterValue.type ? [{id: filterValue.type}] : null}
          placeholder="Activity Type"
          onChange={params => updateFilterValue({ type: params.value[0].id })}
        />
      </Block>
      <Block width="200px" padding="12px">
        <Select
          clearable={false}
          overrides={{ ControlContainer: { style: { backgroundColor: '#fff'}} }}
          options={budgetOptions}
          value={filterValue.price ? [{id: filterValue.price}] : null}
          placeholder="Budget Per Person"
          onChange={params => updateFilterValue({ price: params.value[0].id })}
        />
      </Block>
      <Block width="200px" padding="12px">
        <Select
          clearable={false}
          overrides={{ ControlContainer: { style: { backgroundColor: '#fff'}} }}
          options={durationOptions}
          value={filterValue.duration ? [{id: filterValue.duration}] : null}
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
    if (filterValue.price) {
      // $20 or less
      if (filterValue.price === 1 && venue.price > 20) {
        return false;
      }
      // $20 to $50
      if (filterValue.price === 2 && (venue.price < 20 || venue.price > 50)) {
        return false;
      }
      // $50 to $100
      if (filterValue.price === 3 && (venue.price < 50 || venue.price > 100)) {
        return false;
      }
      // More than $100
      if (filterValue.price === 4 && venue.price < 100) {
        return false;
      }
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
  const history = useHistory();
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
    <Block display="flex" flexDirection="column" height="calc(100vh - 73px)">
      <Block>
        <Filter filterValue={filterValue} updateFilterValue={updateFilterValue} />
      </Block>
      <Block display="flex" flexDirection={["column", "column", "row", "row"]} flex="1 1 auto" overflow={["initial", "initial", "auto", "auto"]}>
        <Block flex="4">
          <DiscoveryMap venues={venues} hoveredVenueId={hoveredVenueId} setHoveredVenueId={setHoveredVenueId}/>
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
                  onClick={() => { history.push(`/${venue.symbol}`) }}
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
