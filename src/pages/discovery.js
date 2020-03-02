import React, { useState } from 'react';
import { Block } from 'baseui/block';
import DiscoveryMap from '../components/map/discovery-map';
import VenueCell from '../components/venue/venue-cell';
import { venues } from '../constants/locations';

export default function Discovery() {
  const [ hoveredVenueId , setHoveredVenueId ] = useState(null);
  return (
    <Block display="flex" flexDirection="column">
      <Block display="flex" height="calc(100vh - 49px)">
        <Block flex="4">
          <DiscoveryMap venues={venues} hoveredVenueId={hoveredVenueId} />
        </Block>
        <Block flex="5" display="flex" flexDirection="column">
          {
            venues.map((venue, index) => {
              return (
                <Block
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
                  <VenueCell key={`cell-${index}`} venue={venue} />
                </Block>
              );
            })
          }
        </Block>
      </Block>
    </Block>
  );
}
