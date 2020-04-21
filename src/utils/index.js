import React, { useRef, useEffect, useState } from 'react';
import ReactGA from "react-ga";
import { useLocation } from 'react-router-dom';
import {
  useQuery
} from '@apollo/react-hooks';
import {
  GET_USER_BY_AUTH
} from '../constants/query';
import { venues as allPhysicalVenues } from '../constants/locations';
import { venues as allVirtualVenues } from '../constants/virtual-locations';
const allVenues = [ ...allPhysicalVenues, ...allVirtualVenues ];

export function useQueryUrl() {
  return new URLSearchParams(useLocation().search);
}

export const usePrevious = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const withTracker = (WrappedComponent, options = {}) => {
  const HOC = props => {
    const ga = useGA();
    const trackPage = page => {
      ga.set({
        page,
        ...options
      });
      ga.pageview(page);
    };
    useEffect(() => trackPage(props.location.pathname), [
      props.location.pathname
    ]);

    return <WrappedComponent {...props} />;
  };

  return HOC;
};

export function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}

export function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function getErrorCode(error) {
  if (error.graphQLErrors.length) {
    return error.graphQLErrors[0].message;
  }
  return null;
}


export function showAlert(client, content) {
  client.writeData({
    data: {
      successAlert: content
    }
  });
}

export function useWindowSize() {
  const isClient = typeof window === 'object';

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}

export function useGA() {
  const { data, loading } = useQuery(GET_USER_BY_AUTH);
  if (loading) {
    ReactGA.initialize(process.env.REACT_APP_GA_ID);
    return ReactGA;
  }

  let getUserByAuth = !data ?  null : data.getUserByAuth

  if (!getUserByAuth) {
    ReactGA.initialize(process.env.REACT_APP_GA_ID);
    return ReactGA;
  }

  ReactGA.initialize(
    process.env.REACT_APP_GA_ID,
    {
      gaOptions: {
        userId: getUserByAuth.user.id
      }
    }
  );

  return ReactGA;
}

export function getHourFromMilitaryHour(hour) {
  if (hour === 12) {
    return '12PM';
  }
  if (hour === 24) {
    return '0AM';
  }
  if (hour > 12) {
    return `${hour - 12}PM`;
  }
  return `${hour}AM`;
}

export function getVenueBySymbol(symbol) {
  const venue = allVenues.find(v => v.symbol === symbol);
  return venue;
}

export function getBackgroundColor() {
  const x = Math.floor(Math.random() * 256);
  const y = Math.floor(Math.random() * 256);
  const z = Math.floor(Math.random() * 180);
  const bgColor = "rgb(" + x + "," + y + "," + z + ")";
  return bgColor;
}
