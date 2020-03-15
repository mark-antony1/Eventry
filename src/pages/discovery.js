import React, { useState, useEffect } from 'react';
import { Block } from 'baseui/block';
import { useHistory, useLocation } from 'react-router-dom';
import { StyledLink } from 'baseui/link';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import {
  Display4,
  Label2,
} from 'baseui/typography';
import { useStyletron } from 'styletron-react';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import DiscoveryMap from '../components/map/discovery-map';
import VenueCell from '../components/venue/venue-cell';
import { venues as allVenues } from '../constants/locations';
import { useDebounce } from '../utils';

// Filter
import { Checkbox } from 'baseui/checkbox';
import { Select } from 'baseui/select';
import ReactGA from "react-ga";
ReactGA.initialize("UA-160350473-1");

const typeOptions = [
  {
    id: 'none',
    label: 'No Activity Type'
  },
  {
    id: 'competitive',
    label: 'Competitive'
  },
  {
    id: 'cooperative',
    label: 'Cooperative'
  },
  {
    id: 'bar',
    label: 'Bar'
  },
  {
    id: 'explore',
    label: 'Explore'
  },
  {
    id: 'class',
    label: 'Class'
  },
  {
    id: 'tour',
    label: 'Tour'
  },
  {
    id: 'food',
    label: 'Food'
  }
];

const durationOptions = [
  {
    id: 'none',
    label: 'Duration'
  },
  {
    id: 1,
    label: '1 hour or less'
  },
  {
    id: 2,
    label: '1 - 3 hours'
  },
  {
    id: 3,
    label: '3+ hours'
  }
];

const budgetOptions = [
  {
    id: 'none',
    label: 'Budget Per Person'
  },
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

function Filter({ venueCount, filterValue, updateFilterValue }) {
  const [ searchTerm, setSearchTerm ] = useState(filterValue.searchTerm);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(
    () => {
      updateFilterValue({
        searchTerm: debouncedSearchTerm
      });
    },
    [debouncedSearchTerm] // Only call effect if debounced search term changes
  );
  const groupSizeOptions = [{
    id: 'none',
    label: 'Group Size'
  }];
  for (let i = 2; i <= 50; i++) {
    groupSizeOptions.push({
      id: i,
      label: i
    });
  }

  return (
    <Block display="flex" flexDirection="column" backgroundColor="#f4f4f4">
      <Block display="flex" alignItems="center" flexWrap="wrap">
        <Block width="180px" padding="12px">
          <Input
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
            }}
            overrides={{ Input: { style: { backgroundColor: '#fff'}} }}
            placeholder="Search Venue"
          />
        </Block>
        <Block width="130px" padding="12px">
          <Select
            clearable={false}
            searchable={false}
            overrides={{ ControlContainer: { style: { backgroundColor: '#fff'}} }}
            options={groupSizeOptions}
            value={filterValue.recommendedGroupsize ? [{id: filterValue.recommendedGroupsize}] : null}
            placeholder="Group Size"
            onChange={params => updateFilterValue({ recommendedGroupsize: params.value[0].id })}
          />
        </Block>
        <Block width="140px" padding="12px">
          <Select
            clearable={false}
            searchable={false}
            overrides={{ ControlContainer: { style: { backgroundColor: '#fff'}} }}
            options={typeOptions}
            value={filterValue.type ? [{id: filterValue.type}] : null}
            placeholder="Activity Type"
            onChange={params => updateFilterValue({ type: params.value[0].id })}
          />
        </Block>
        <Block width="180px" padding="12px">
          <Select
            clearable={false}
            searchable={false}
            overrides={{ ControlContainer: { style: { backgroundColor: '#fff'}} }}
            options={budgetOptions}
            value={filterValue.price ? [{id: filterValue.price}] : null}
            placeholder="Budget Per Person"
            onChange={params => updateFilterValue({ price: params.value[0].id })}
          />
        </Block>
        <Block width="150px" padding="12px">
          <Select
            clearable={false}
            searchable={false}
            overrides={{ ControlContainer: { style: { backgroundColor: '#fff'}} }}
            options={durationOptions}
            value={filterValue.duration ? [{id: filterValue.duration}] : null}
            placeholder="Duration"
            onChange={params => updateFilterValue({ duration: params.value[0].id })}
          />
        </Block>
        <Block padding="12px">
          <Checkbox
            checked={filterValue.indoor}
            onChange={e => updateFilterValue({ indoor: e.target.checked })}
          >
            Indoor
          </Checkbox>
        </Block>
        <Block padding="12px">
          <Checkbox
            checked={filterValue.outdoor}
            onChange={e => updateFilterValue({ outdoor: e.target.checked })}
          >
            Outdoor
          </Checkbox>
        </Block>
        <Block padding="12px">
          <Label2 color="#484848"><b>{venueCount} results</b></Label2>
        </Block>
      </Block>
    </Block>
  );
}

function filterVenues(venues, filterValue) {
  return venues.filter(venue => {
    if (filterValue.price && filterValue.price !== 'none') {
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
    if (filterValue.recommendedGroupsize && filterValue.recommendedGroupsize !== 'none' && (venue.recommendedGroupsize[0] > filterValue.recommendedGroupsize || venue.recommendedGroupsize[1] < filterValue.recommendedGroupsize)) {
      return false;
    }
    if (filterValue.duration && filterValue.duration !== 'none') {
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
    if (filterValue.type !== 'none' && filterValue.type && venue.activityType !== filterValue.type) {
      return false;
    }
    if (!filterValue.indoor || !filterValue.outdoor) {
      if (filterValue.indoor && venue.tags.indexOf('indoor') === -1) {
        return false;
      }
      if (filterValue.outdoor && venue.tags.indexOf('outdoor') === -1) {
        return false;
      }
    }
    if (filterValue.searchTerm) {
      if (
        !venue.description.toLowerCase().includes(filterValue.searchTerm.toLowerCase()) &&
        !venue.teaserDescription.toLowerCase().includes(filterValue.searchTerm.toLowerCase()) &&
        !venue.name.toLowerCase().includes(filterValue.searchTerm.toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  });
}

const LIST_SIZE = 10;

const generateLabel = (action, value) => {
  if (action === 'type') {
    return value;
  }
  if ((action === 'indoor' || action === 'outdoor') && !value) {
    return `${action} off`
  }
  if (action === 'recommendedGroupsize') {
    return `${Math.floor(value / 10) * 10} - ${Math.ceil(value / 10) * 10}`;
  }
  if (action === 'duration') {
    return durationOptions.find(d => d.id === value).label;
  }
  if (action === 'price') {
    return budgetOptions.find(d => d.id === value).label;
  }
  return '';
};

const emitFilterEvent = (payload) => {
  const action = Object.keys(payload)[0];
  const label = generateLabel(action, payload[action]);
  ReactGA.event({
    category: 'Filter',
    action,
    label
  });
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function initializeFilter(queryUrl) {
  const indoor = queryUrl.get('indoor');
  const outdoor = queryUrl.get('outdoor');
  const price = queryUrl.get('price');
  const duration = queryUrl.get('duration');
  const type = queryUrl.get('type');
  const groupSize = queryUrl.get('groupSize');
  const searchTerm = queryUrl.get('searchTerm');
  return {
    price: !isNaN(price) ? Number(price) : null,
    recommendedGroupsize: !isNaN(groupSize) ? Number(groupSize) : null,
    duration: !isNaN(duration) ? Number(duration) : null,
    type: type ? type : null,
    indoor: indoor === 'false' ? false : true,
    outdoor: outdoor === 'false' ? false : true,
    searchTerm: searchTerm ? searchTerm : ''
  };
}

function setFilterQueryUrl(history, queryUrl, payload) {
  const indoor = queryUrl.get('indoor');
  const outdoor = queryUrl.get('outdoor');
  const price = queryUrl.get('price');
  const duration = queryUrl.get('duration');
  const type = queryUrl.get('type');
  const groupSize = queryUrl.get('groupSize');
  const action = Object.keys(payload)[0];
  if (payload[action] === 'none') {
    queryUrl.delete(action);
    if (action === 'recommendedGroupsize') {
      queryUrl.delete('groupSize');
    }
  } else if (action === 'indoor') {
    if (action === 'indoor' && !payload[action]) {
      queryUrl.set('indoor', 'false');
    }
    if (action === 'indoor' && payload[action]) {
      queryUrl.delete('indoor');
    }
  } else if (action === 'outdoor') {
    if (action === 'outdoor' && !payload[action]) {
      queryUrl.set('outdoor', 'false');
    }
    if (action === 'outdoor' && payload[action]) {
      queryUrl.delete('outdoor');
    }
  } else if (action === 'recommendedGroupsize') {
    queryUrl.set('groupSize', payload[action]);
  } else if (action === 'searchTerm') {
    if (payload[action]) {
      queryUrl.set('searchTerm', payload[action]);
    } else {
      queryUrl.delete('searchTerm');
    }
  } else {
    queryUrl.set(action, payload[action]);
  }
  history.push({
    pathname: '',
    search: queryUrl.toString()
  });
}

export default function Discovery() {
  const [ css ] = useStyletron();
  const history = useHistory();
  const queryUrl = useQuery();
  const [ venueRefs, setVenueRefs ] = useState({});
  const [ venueIndex, setVenueIndex ] = useState(0);
  const [ scrollToId, setScrollToId ] = useState(null);
  const [ venues, setVenues ] = useState(allVenues);
  const [ hoveredVenueId , setHoveredVenueId ] = useState(null);
  const [ filterValue , setFilterValue ] = useState(initializeFilter(queryUrl));

  useEffect(() => {
    document.title = `TeamBright`;
    setVenues(filterVenues(allVenues, filterValue));
  }, []);

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
    setFilterQueryUrl(history, queryUrl, payload);
    emitFilterEvent(payload);
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

  const slicedVenues = venues.slice(venueIndex, venueIndex + LIST_SIZE);

  return (
    <Block display="flex" flexDirection="column" height="calc(100vh - 48px)">
      <Block>
        <Filter
          filterValue={filterValue}
          updateFilterValue={updateFilterValue}
          venueCount={venues.length}
        />
      </Block>
      <Block display="flex" flexDirection={["column", "column", "row", "row"]} flex="1 1 auto" overflow={["initial", "initial", "auto", "auto"]}>
        <Block flex="4">
          <DiscoveryMap venues={venues} hoveredVenueId={hoveredVenueId} setHoveredVenueId={setHoveredVenueId} onVenueClicked={onVenueClicked} />
        </Block>
        {
          venues.length ?
          <Block flex="5" display="flex" flexDirection="column" overflow="auto" backgroundColor="#F4F4F4">
            <Block display="flex" flexWrap="wrap">
            {
              slicedVenues.map((venue, index) => {
                return (
                  <Block
                    flex="0 1 calc(50% - 24px)"
                    margin="12px"
                    ref={venueRefs[venue.id]}
                    key={venue.id}
                    className={css({
                      opacity: hoveredVenueId === venue.id ? 0.8 : 1,
                      cursor: 'pointer'
                    })}
                    onMouseLeave={() => { setHoveredVenueId(null) }}
                    onMouseEnter={() => { setHoveredVenueId(venue.id) }}
                  >
                    <a href={`/${venue.symbol}`} target="_blank" className={css({ textDecoration: 'none' })}>
                      <VenueCell venue={venue} hovered={hoveredVenueId === venue.id} />
                    </a>
                  </Block>
                );
              })
            }
            </Block>
            <Block display="flex" width="100%">
              <Block flex="1" display="flex" flexDirection="column">
                <Button kind="minimal" onClick={handlePrevPage}>
                  <ChevronLeft size={36} />
                </Button>
              </Block>
              <Block flex="1" display="flex" flexDirection="column">
                <Button kind="minimal" onClick={handleNextPage}>
                  <ChevronRight size={36} />
                </Button>
              </Block>
            </Block>
          </Block> :
          <Block flex="5" display="flex" backgroundColor="#F4F4F4" alignItems="center" justifyContent="center">
            <Display4><b>No Result</b></Display4>
          </Block>
        }
      </Block>
    </Block>
  );
}
