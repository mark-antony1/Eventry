import React, { useState, useEffect } from 'react';
import { Block } from 'baseui/block';
import { Label3 } from 'baseui/typography';
import ReactMapGL, { Marker, Layer, WebMercatorViewport } from 'react-map-gl';

function MarkerIcon({ hovered }) {
  return (
    <svg viewBox="0 0 64 64" width="24" aria-labelledby="title"
    aria-describedby="desc" role="img">
      <path strokeWidth="4"
      fill={hovered ? "#FFBE2E" : "#2EFFB5"}
      strokeMiterlimit="10" stroke="#202020" d="M32 2a20 20 0 0 0-20 20c0 18 20 39 20 39s20-21 20-39A20 20 0 0 0 32 2z"
      data-name="layer2" strokeLinejoin="round" strokeLinecap="round"></path>
    </svg>
  );
}
function VenuePoint({ venue, hoveredVenueId, setHoveredVenueId }) {
  return (
    <Marker latitude={venue.location.latitude} longitude={venue.location.longitude}>
      <Block
        onMouseLeave={() => { setHoveredVenueId(null) }}
        onMouseEnter={() => { setHoveredVenueId(venue.id) }}
      >
        <MarkerIcon hovered={venue.id === hoveredVenueId} />
        {
          venue.id === hoveredVenueId &&
          <Block backgroundColor="#f4f4f4" overrides={{ Block: { style: { border: '2px solid #202020' } } }} padding="4px">
            <Label3>{venue.name}</Label3>
          </Block>
        }
      </Block>
    </Marker>
  );
}

function venuesToLocations(venues) {
  return venues.map((venue) => {
    return [venue.location.longitude, venue.location.latitude];
  });
}

export default function DiscoveryMap({ venues, hoveredVenueId, disableScrollZoom, setHoveredVenueId }) {
  const [ viewport, setViewport ] = useState(getViewport());

  useEffect(() => {
    setViewport(getViewport());
  }, [venues]);

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
