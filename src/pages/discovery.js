import React, { useState, useEffect } from 'react';
import { Block } from 'baseui/block';
import { useHistory } from 'react-router-dom';
import { StyledLink } from 'baseui/link';
import { Button } from 'baseui/button';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
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
    id: 'sing',
    label: 'Sing'
  },
  {
    id: 'dance',
    label: 'Dance'
  },
  {
    id: 'active',
    label: 'Active'
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

const LIST_SIZE = 10;

export default function Discovery() {
  const history = useHistory();
  const [ venueRefs, setVenueRefs ] = useState({});
  const [ venueIndex, setVenueIndex ] = useState(0);
  const [ scrollToId, setScrollToId ] = useState(null);
  const [ venues, setVenues ] = useState(allVenues);
  const [ hoveredVenueId , setHoveredVenueId ] = useState(null);
  const [ filterValue , setFilterValue ] = useState({
    price: null,
    recommendedGroupsize: null,
    duration: null,
    type: null,
    place: null
  });

  useEffect(() => {
    setVenueRefs(venues.slice(venueIndex, venueIndex + LIST_SIZE).reduce((acc, venue) => {
      acc[venue.id] = React.createRef();
      return acc;
    }, {}));
  }, [venueIndex]);

  useEffect(() => {
    if (scrollToId !== null && venueRefs[scrollToId] && venueRefs[scrollToId].current) {
        venueRefs[scrollToId].current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        setScrollToId(null);
    }
  }, [venueRefs[scrollToId] && venueRefs[scrollToId].current]);

  const updateFilterValue = (payload) => {
    setFilterValue({
      ...filterValue,
      ...payload
    });
    setVenues(filterVenues(allVenues, {
      ...filterValue,
      ...payload
    }));
    setVenueIndex(0);
    setScrollToId(null);
  };

  const onVenueClicked = (id) => {
    if (venueRefs[id] && venueRefs[id].current) {
      venueRefs[id].current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      let index = 0;
      venues.forEach((v, i) => {
        if (v.id === id) {
          index = i;
        }
      });
      setScrollToId(id);
      setVenueIndex(Math.floor(index / 10) * 10);
    }

  };

  const handlePrevPage = () => {
    if (venueIndex !== 0) {
      setVenueIndex(venueIndex - LIST_SIZE);
    }
  };

  const handleNextPage = () => {
    if (venueIndex + LIST_SIZE <= venues.length) {
      setVenueIndex(venueIndex + LIST_SIZE);
    }
  };

  return (
    <Block display="flex" flexDirection="column" height="calc(100vh - 48px)">
      <Block>
        <Filter filterValue={filterValue} updateFilterValue={updateFilterValue} />
      </Block>
      <Block display="flex" flexDirection={["column", "column", "row", "row"]} flex="1 1 auto" overflow={["initial", "initial", "auto", "auto"]}>
        <Block flex="4">
          <DiscoveryMap venues={venues} hoveredVenueId={hoveredVenueId} setHoveredVenueId={setHoveredVenueId} onVenueClicked={onVenueClicked} />
        </Block>
        <Block flex="5" display="flex" flexDirection="column" overflow="auto" backgroundColor="#F4F4F4">
          {
            venues.slice(venueIndex, venueIndex + LIST_SIZE).map((venue, index) => {
              return (
                <Block
                  ref={venueRefs[venue.id]}
                  key={venue.id}
                  overrides={{
                    Block: {
                      style: {
                        opacity: hoveredVenueId === venue.id ? 0.8 : 1,
                        cursor: 'pointer'
                      }
                    }
                  }}
                  marginBottom="12px"
                  onClick={() => { history.push(`/${venue.symbol}`) }}
                  onMouseLeave={() => { setHoveredVenueId(null) }}
                  onMouseEnter={() => { setHoveredVenueId(venue.id) }}
                >
                  <VenueCell venue={venue} />
                </Block>
              );
            })
          }
          <Block display="flex">
            <Block flex="1" display="flex" flexDirection="column">
              <Button onClick={handlePrevPage}>
                <ChevronLeft color="#fff" size={36} />
              </Button>
            </Block>
            <Block flex="1" display="flex" flexDirection="column">
              <Button onClick={handleNextPage}>
                <ChevronRight color="#fff" size={36} />
              </Button>
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  );
}
