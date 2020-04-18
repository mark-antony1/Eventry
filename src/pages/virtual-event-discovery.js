import React, { useState, useEffect } from 'react';
import { Block } from 'baseui/block';
import { useHistory } from 'react-router-dom';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import {
  Display4,
  Label2,
  Label1,
} from 'baseui/typography';
import { useStyletron } from 'styletron-react';
import ChevronLeft from 'baseui/icon/chevron-left';
import ChevronRight from 'baseui/icon/chevron-right';
import HeaderNavigation from '../components/header-navigation';
import VenueCell from '../components/venue/venue-cell';
import { venues as allVenues } from '../constants/virtual-locations';
import { useDebounce, useQueryUrl, useGA } from '../utils';

// Filter
import { Checkbox } from 'baseui/checkbox';
import { Select } from 'baseui/select';

const groupSizeOptions = [
  {
    id: 'none',
    label: 'Group Size'
  },
  {
    id: 1,
    label: '2 - 10'
  },
  {
    id: 2,
    label: '10 - 20'
  },
  {
    id: 3,
    label: '20 - 50'
  },
  {
    id: 4,
    label: '50+'
  }
];

const typeOptions = [
  {
    id: 'none',
    label: 'Activity Type'
  },
  {
    id: 'game',
    label: 'Game'
  },
  {
    id: 'hangout',
    label: 'Hangout'
  },
  {
    id: 'vr',
    label: 'VR'
  },
  {
    id: 'event',
    label: 'Event'
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


function SearchBar({ filterValue, updateFilterValue }) {
  const [ searchTerm, setSearchTerm ] = useState(filterValue.searchTerm);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(
    () => {
      updateFilterValue({
        searchTerm: debouncedSearchTerm
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearchTerm]
  );

  return (
    <Block width={['100%', '100%', '300px', '300px']}>
      <Input
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
        }}
        overrides={{ Input: { style: { backgroundColor: '#fff'}} }}
        placeholder="Search Venue"
      />
    </Block>
  );
}

function Filter({ venueCount, filterValue, updateFilterValue }) {
  return (
    <Block display="flex" flexDirection="column" backgroundColor="#f4f4f4">
      <Block display="flex" alignItems="center" flexWrap="wrap">
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
        <Block width="200px" padding="12px">
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

    if (filterValue.recommendedGroupsize && filterValue.recommendedGroupsize !== 'none') {
      if (filterValue.recommendedGroupsize === 1 && venue.recommendedGroupsize[0] > 10) {
        return false;
      } else if (filterValue.recommendedGroupsize === 2 && (venue.recommendedGroupsize[1] < 10 || venue.recommendedGroupsize[0] > 20)) {
        return false;
      } else if (filterValue.recommendedGroupsize === 3 && (venue.recommendedGroupsize[1] < 20 || venue.recommendedGroupsize[0] > 50)) {
        return false;
      } else if (filterValue.recommendedGroupsize === 4 && venue.recommendedGroupsize[1] < 50) {
        return false;
      }
    }

    if (filterValue.type !== 'none' && filterValue.type && venue.activityType !== filterValue.type) {
      return false;
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

const LIST_SIZE = 9;

const generateGALabel = (action, value) => {
  if (action === 'type') {
    return value;
  }
  if (action === 'recommendedGroupsize') {
    return groupSizeOptions.find(d => d.id === value).label;
  }
  if (action === 'price') {
    return budgetOptions.find(d => d.id === value).label;
  }
  return '';
};

const emitFilterEvent = (payload, ga) => {
  const action = Object.keys(payload)[0];
  const label = generateGALabel(action, payload[action]);
  ga.event({
    category: 'Filter',
    action,
    label
  });
};

function initializeFilter(queryUrl) {
  const price = queryUrl.get('price');
  const type = queryUrl.get('type');
  const groupSize = queryUrl.get('groupSize');
  const searchTerm = queryUrl.get('searchTerm');
  return {
    price: !isNaN(price) ? Number(price) : null,
    recommendedGroupsize: !isNaN(groupSize) ? Number(groupSize) : null,
    type: type ? type : null,
    searchTerm: searchTerm ? searchTerm : ''
  };
}

function setFilterQueryUrl(history, queryUrl, payload) {
  const action = Object.keys(payload)[0];
  if (payload[action] === 'none') {
    queryUrl.delete(action);
    if (action === 'recommendedGroupsize') {
      queryUrl.delete('groupSize');
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
  const ga = useGA();
  const [ css ] = useStyletron();
  const history = useHistory();
  const queryUrl = useQueryUrl();
  const [ venueRefs, setVenueRefs ] = useState({});
  const [ venueIndex, setVenueIndex ] = useState(0);
  const [ scrollToId, setScrollToId ] = useState(null);
  const [ venues, setVenues ] = useState(allVenues);
  const [ hoveredVenueId , setHoveredVenueId ] = useState(null);
  const [ filterValue , setFilterValue ] = useState(initializeFilter(queryUrl));

  useEffect(() => {
    document.title = `TeamBright`;
    setVenues(filterVenues(allVenues, filterValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setVenueRefs(venues.slice(venueIndex, venueIndex + LIST_SIZE).reduce((acc, venue) => {
      acc[venue.id] = React.createRef();
      return acc;
    }, {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueIndex]);

  useEffect(() => {
    if (scrollToId !== null && venueRefs[scrollToId] && venueRefs[scrollToId].current) {
        venueRefs[scrollToId].current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        setScrollToId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueRefs[scrollToId] && venueRefs[scrollToId].current]);

  const updateFilterValue = (payload) => {
    setFilterQueryUrl(history, queryUrl, payload);
    emitFilterEvent(payload, ga);
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
      setVenueIndex(Math.floor(index / LIST_SIZE) * LIST_SIZE);
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
    <Block display="flex" flexDirection="column" height="100vh">
      <HeaderNavigation>
        <SearchBar filterValue={filterValue} updateFilterValue={updateFilterValue} />
      </HeaderNavigation>
      <Block>
        <Filter
          filterValue={filterValue}
          updateFilterValue={updateFilterValue}
          venueCount={venues.length}
        />
      </Block>
      <Block display="flex" flex="1 1 auto" overflow={["initial", "initial", "auto", "auto"]}>
        {
          venues.length ?
          <Block display="flex" flex="3" flexDirection="column" overflow="auto" backgroundColor="#F4F4F4">
            <Block display="flex" flexDirection={['column', 'column', 'row', 'row']} flexWrap="wrap">
            {
              slicedVenues.map((venue, index) => {
                return (
                  <Block
                    flex={"0 1 calc(33% - 24px)"}
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
                    <a href={`/${venue.symbol}`} rel="noopener noreferrer" target="_blank" className={css({ textDecoration: 'none' })}>
                      <VenueCell venue={venue} hovered={hoveredVenueId === venue.id} />
                    </a>
                  </Block>
                );
              })
            }
            </Block>
            <Block display="flex" width="100%" alignItems="center">
              <Block flex="1" display="flex" flexDirection="column">
                <Button kind="minimal" onClick={handlePrevPage}>
                  <ChevronLeft size={36} /> <b>{Math.floor(venueIndex / LIST_SIZE) ? Math.floor(venueIndex / LIST_SIZE) : null}</b>
                </Button>
              </Block>
              <Block>
                <b>{Math.floor(venueIndex / LIST_SIZE) + 1}</b>
              </Block>
              <Block flex="1" display="flex" flexDirection="column">
                {
                  (venueIndex + LIST_SIZE) <= venues.length &&
                  <Button kind="minimal" onClick={handleNextPage}>
                    <b>{Math.floor(venueIndex / LIST_SIZE) + 2}</b> <ChevronRight size={36} />
                  </Button>
                }
              </Block>
            </Block>
          </Block> :
          <Block flex="3" display="flex" backgroundColor="#F4F4F4" alignItems="center" justifyContent="center">
            <Display4><b>No Result</b></Display4>
          </Block>
        }
        <Block flex="1" flexDirection="column" display={['none', 'none', 'flex', 'flex']} justifyContent="center" padding="24px">
          <img src={process.env.PUBLIC_URL +  '/logo.png'} width="100px" />
          <Display4 color="#02A84E"><b>Share virtual events you like</b></Display4>
          <Label1 color="#777"><b>Is it not listed here? Send us a message!</b></Label1>
          <Block display="flex" justifyContent="flex-end" paddingRight="100px">
            <img src={process.env.PUBLIC_URL +  '/arrow.png'} width="100px" />
          </Block>
        </Block>
      </Block>
    </Block>
  );
}
