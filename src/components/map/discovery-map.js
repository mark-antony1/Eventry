import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Label3, Label2 } from 'baseui/typography';
import { Tag } from 'baseui/tag';
import ReactMapGL, { Marker, WebMercatorViewport } from 'react-map-gl';
import { usePrevious } from '../../utils';

function MarkerIcon({ hovered }) {
  return (
    <svg viewport="0 0 32 32" width="24" height="48" aria-labelledby="title"
    aria-describedby="desc" role="img">
      <path strokeWidth="1"
      fill={hovered ? "#FFBE2E" : "#006937"}
      strokeMiterlimit="10" stroke="#202020" d="M12,10 L0,23 L12,48 L24,23 L12,10"
      data-name="layer2" strokeLinejoin="round" strokeLinecap="round"></path>
    </svg>
  );
}

function VenuePoint({ venue, hoveredVenueId, setHoveredVenueId, onVenueClicked }) {
  const [css] = useStyletron();
  return (
    <Marker
      className={
        venue.id === hoveredVenueId ?
        css({
          zIndex: 1
        }) : null
      }
      latitude={venue.location.latitude}
      longitude={venue.location.longitude}
    >
      <Block
        marginTop="-48px"
        marginLeft="-12px"
        onMouseLeave={() => { if (setHoveredVenueId) setHoveredVenueId(null) }}
        onMouseEnter={() => { if (setHoveredVenueId) setHoveredVenueId(venue.id) }}
        onClick={() => { if (onVenueClicked) onVenueClicked(venue.id) } }
        overrides={{ Block: { style: { cursor: 'pointer' } } }}
      >
        <MarkerIcon
          hovered={venue.id === hoveredVenueId}
        />
      </Block>
    </Marker>
  );
}

function compareVenues(prevVenues, venues) {
  if (!prevVenues) {
    return true;
  }
  if (!venues) {
    return true;
  }
  if (prevVenues.length > 50 && prevVenues.length === venues.length) {
    return false;
  } else if (prevVenues.length > 50 && prevVenues.length !== venues.length) {
    return true;
  }
  for (let i = 0; i < prevVenues.length; i++) {
    if (venues[i] && prevVenues[i].id !== venues[i].id) {
      return true;
    }
  }

  return false;
}

export default function DiscoveryMap({ venues, hoveredVenueId, disableScrollZoom, setHoveredVenueId, onVenueClicked }) {
  const prevVenues = usePrevious(venues);
  const history = useHistory();
  const [ viewport, setViewport ] = useState(getViewport());
  const [ pinnedVenue, setPinnedVenue ] = useState(null);

  useEffect(() => {
    if (compareVenues(prevVenues, venues)) {
      setViewport(getViewport());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues]);

  useEffect(() => {
    if (hoveredVenueId) {
      setPinnedVenue(venues.find((v) => v.id === hoveredVenueId));
    } else {
      setPinnedVenue(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredVenueId]);

  function getViewport() {
    if (venues.length === 0) {
      return {
        latitude: 37.7577,
        longitude: -122.4376,
        zoom: 12,
      };
    }
    if (venues.length === 1) {
      return {
        latitude: venues[0].location.latitude,
        longitude: venues[0].location.longitude,
        zoom: 12,
      };
    }
    let minLat = venues[0].location.latitude;
    let minLong = venues[0].location.longitude;
    let maxLat = venues[0].location.latitude;
    let maxLong = venues[0].location.longitude;
    venues.forEach((venue) => {
      if (minLat > venue.location.latitude) {
        minLat = venue.location.latitude;
      }
      if (minLong > venue.location.longitude) {
        minLong = venue.location.longitude;
      }
      if (maxLat < venue.location.latitude) {
        maxLat = venue.location.latitude;
      }
      if (maxLong < venue.location.longitude) {
        maxLong = venue.location.longitude;
      }
    });

    const vp = new WebMercatorViewport({ width: 300, height: 300 })
      .fitBounds([[maxLong, minLat], [minLong, maxLat]], { padding: 10 });

    return vp;
  }
  return (
    <Block position="relative" width="100%" height="100%">
      <Block position="absolute" width="50%" top="10px" left="10px" overrides={{ Block: { style: { zIndex: 1 } } }}>
        {
          pinnedVenue &&
          <Block
            backgroundColor="#fff"
            display="flex"
            flexDirection="column"
            onClick={() => { history.push(`/${pinnedVenue.symbol}`) }}
            overrides={{ Block: { style: { cursor: 'pointer' } } }}
          >
            <Block backgroundColor="#0B6839" padding="8px">
              <Label3 color="#fff">{pinnedVenue.name}</Label3>
              <Label2 color="#fff">{pinnedVenue.rating} <FaStar style={{verticalAlign: 'text-top'}} /></Label2>
            </Block>
            <Block height="80px">
              <img alt={`preview-venue`} width="100%" height="100%" style={{ objectFit: 'cover' }} src={pinnedVenue.photos[0]} />
            </Block>
            <Block padding="8px">
              {
                pinnedVenue.tags.map((tag, index) => {
                  return (
                    <Tag key={index} closeable={false} kind="accent" variant="outlined">
                      {tag}
                    </Tag>
                  );
                })
              }
              {
                pinnedVenue.vibe.map((vibe, index) => {
                  return (
                    <Tag key={index} closeable={false} kind="accent" variant="outlined">
                      {vibe}
                    </Tag>
                  );
                })
              }
            </Block>
          </Block>
        }
      </Block>
      <ReactMapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle='mapbox://styles/mapbox/streets-v9'
        onViewportChange={(vp) => setViewport(vp)}
        scrollZoom={disableScrollZoom ? false : true}
        mapboxApiAccessToken="pk.eyJ1IjoianVuc3VobGVlOTQiLCJhIjoiY2pzbDk3aHI5MXQycDQzazZxNXc5cG52ayJ9.bMXJRfKZO38TdR7szbu4xw"
      >
        {venues.map((venue, index) => <VenuePoint setHoveredVenueId={setHoveredVenueId} onVenueClicked={onVenueClicked} venue={venue} hoveredVenueId={hoveredVenueId} id={venue.id} key={index} />)}
      </ReactMapGL>
    </Block>
  );
}
