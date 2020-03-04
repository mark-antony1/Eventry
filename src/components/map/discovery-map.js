import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Label3 } from 'baseui/typography';
import { Tag } from 'baseui/tag';
import ReactMapGL, { Marker, Layer, WebMercatorViewport } from 'react-map-gl';

function MarkerIcon({ hovered }) {
  return (
    <svg viewport="0 0 32 32" width="24" height="48" aria-labelledby="title"
    aria-describedby="desc" role="img">
      <path strokeWidth="1"
      fill={hovered ? "#FFBE2E" : "#2EFFB5"}
      strokeMiterlimit="10" stroke="#202020" d="M12,10 L0,23 L12,48 L24,23 L12,10"
      data-name="layer2" strokeLinejoin="round" strokeLinecap="round"></path>
    </svg>
  );
}

function minutesToAverageTimeSpent(minutes) {
  if (minutes <= 60) {
    return '1 hour or less';
  }

  if (minutes > 60 && minutes <= 180) {
    return '1 - 3 hours';
  }

  return '3 hours or more';
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

function venuesToLocations(venues) {
  return venues.map((venue) => {
    return [venue.location.longitude, venue.location.latitude];
  });
}

export default function DiscoveryMap({ venues, hoveredVenueId, disableScrollZoom, setHoveredVenueId, onVenueClicked }) {
  const history = useHistory();
  const [ viewport, setViewport ] = useState(getViewport());
  const [ pinnedVenue, setPinnedVenue ] = useState(null);

  useEffect(() => {
    setViewport(getViewport());
  }, [venues]);

  useEffect(() => {
    if (hoveredVenueId) {
      setPinnedVenue(venues.find((v) => v.id === hoveredVenueId));
    }
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
            <Block backgroundColor="#000" padding="8px">
              <Label3 color="#fff">{pinnedVenue.name}</Label3>
              <Label3 color="#fff">⭐{pinnedVenue.rating}</Label3>
            </Block>
            <Block height="80px">
              <img width="100%" height="100%" style={{ objectFit: 'cover' }} src={pinnedVenue.photos[0]} />
            </Block>
            <Block>
              {
                pinnedVenue.tags.map((tag, index) => {
                  return (
                    <Tag key={index} closeable={false} kind="accent">
                      {tag}
                    </Tag>
                  );
                })
              }
              {
                pinnedVenue.vibe.map((vibe, index) => {
                  return (
                    <Tag key={index} closeable={false} kind="accent">
                      {vibe}
                    </Tag>
                  );
                })
              }
            </Block>
            <Block paddingLeft="8px" paddingRight="8px" paddingBottom="8px">
              <Label3>Budget: ${pinnedVenue.price} per person</Label3>
            </Block>
          </Block>
        }
      </Block>
      <ReactMapGL
        {...viewport}
        width="100%"
        height="100%"
        onViewportChange={(vp) => setViewport(vp)}
        scrollZoom={disableScrollZoom ? false : true}
        mapboxApiAccessToken="pk.eyJ1IjoianVuc3VobGVlOTQiLCJhIjoiY2pzbDk3aHI5MXQycDQzazZxNXc5cG52ayJ9.bMXJRfKZO38TdR7szbu4xw"
      >
        {venues.map((venue, index) => <VenuePoint setHoveredVenueId={setHoveredVenueId} onVenueClicked={onVenueClicked} venue={venue} hoveredVenueId={hoveredVenueId} id={venue.id} key={index} />)}
      </ReactMapGL>
    </Block>
  );
}
