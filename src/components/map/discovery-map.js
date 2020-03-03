import React, { useState, useEffect } from 'react';
import { Block } from 'baseui/block';
import ReactMapGL, { Marker, Layer, WebMercatorViewport } from 'react-map-gl';

function VenuePoint({ venue, hoveredVenueId, setHoveredVenueId }) {
  return (
    <Marker latitude={venue.location.latitude} longitude={venue.location.longitude}>
      <Block
        width="24px"
        height="24px"
        onMouseLeave={() => { setHoveredVenueId(null) }}
        onMouseEnter={() => { setHoveredVenueId(venue.id) }}
        backgroundColor={venue.id === hoveredVenueId ? '#FFBA2E' : '#00C09B'}
        overrides={{
          Block: {
            style: {
              borderRadius: '500px'
            }
          }
        }}
      />
      {venue.id === hoveredVenueId ? venue.name : ""}
    </Marker>
  );
}

function venuesToLocations(venues) {
  return venues.map((venue) => {
    return [venue.location.longitude, venue.location.latitude];
  });
}

function getViewport(venues) {
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

  const vp = new WebMercatorViewport({width: 300, height: 500})
    .fitBounds([[maxLong, minLat], [minLong, maxLat]]);

  return vp;
}

export default function DiscoveryMap({ venues, hoveredVenueId, disableScrollZoom, setHoveredVenueId }) {
  const [ viewport, setViewport ] = useState(getViewport(venues));

  useEffect(() => {
    setViewport(getViewport(venues));
  }, [venues]);
  return (
    <ReactMapGL
      {...viewport}
      width="100%"
      height="100%"
      onViewportChange={(vp) => setViewport(vp)}
      scrollZoom={disableScrollZoom ? false : true}
      mapboxApiAccessToken="pk.eyJ1IjoianVuc3VobGVlOTQiLCJhIjoiY2pzbDk3aHI5MXQycDQzazZxNXc5cG52ayJ9.bMXJRfKZO38TdR7szbu4xw"
    >
      {venues.map((venue, index) => <VenuePoint setHoveredVenueId={setHoveredVenueId} venue={venue} hoveredVenueId={hoveredVenueId} id={venue.id} key={index} />)}
    </ReactMapGL>
  );
}
