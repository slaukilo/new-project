import axios from 'axios';
//import { LogOutput } from 'concurrently';
//import { useEffect } from 'react';

/**
 * Handles logic for retrieving the Spotify access token from localStorage
 * or URL query params
 * @returns {string} A Spotify access token
*/
const getAccessToken = () => {// Pull access and refresh token query params to store
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const queryParams = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
  };
  const hasError = urlParams.get('error');

  // If theres an error OR the token in localStorage has expires, refresh the token
  if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
    refreshToken();
  }

  // If there is a valid access token in LocalStorage, use that token
  if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
    return LOCALSTORAGE_VALUES.accessToken;
  }

  // If there is a token in the url query params, user is logging in for the first time
  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    // Store query params in localStorage
    for (const property in queryParams) {
      window.localStorage.setItem(property, queryParams[property]);
    }
    // Set timestamp
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
    // Return access token from query params
    return queryParams[LOCALSTORAGE_KEYS.accessToken];

  }
	//console.log(accessToken);
	//console.log(refreshToken);

  // We should never reach here!
	return false;
};

// Map for local Storage keys
const LOCALSTORAGE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expireTime: 'spotify_token_expire_time',
  timestamp: 'spotify_token_timestamp',
}

// Map to retrieve local Storage values
const LOCALSTORAGE_VALUES = {
  accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
  expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};

/**
  * Checks if the amount of time that has elapsed between the timestamp in localStorage
  * and now is greater than the expiration time of 3600 seconds (1 hour).
  * @returns {boolean} Whether or not the access token in localStorage has expired
*/
const hasTokenExpired = () => {
  const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;
  if (!accessToken || !timestamp ) {
    return false;
  }
  const msElapsed = Date.now() - Number(timestamp);
  return (msElapsed / 1000) > Number(expireTime);
};

/**
 * Clear out all localStorage items that have been set and reload page 
 * @return {void}
 */
export const logout = () => {
  // Clear out all localStorage items
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }
  // Move to homepage
  window.location = window.location.origin;
}

/**
  * Use the refresh token in localStorage to hit the /refresh_token endpoint
  * in our Node app, then update values in localStorage with data from response.
  * @returns {void}
*/
const refreshToken = async () => {
  try {
    if (!LOCALSTORAGE_VALUES.refreshToken || 
      LOCALSTORAGE_VALUES.refreshToken === 'undefined' ||
      (Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000) < 1000)
    {
      console.error('No refresh token available');
      logout();
    }

    // Use `/refresh_token` endpoint from Node app
    const { data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`);

    // Update local storage values
    window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.access_token);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

    // Reload the page to reflect localStorage updates
    window.location.reload();

  } catch (e) {
    console.error(e);
  }
};

export const accessToken = getAccessToken();
//##########################################################################

/**
 * Axios global request headers
 * https://github.com/axios/axios#global-axios-defaults
 */
 axios.defaults.baseURL = 'https://api.spotify.com/v1';
 axios.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
 axios.defaults.headers['Content-Type'] = 'application/json';

 /**
  * Get current usr profile
  * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-current-users-profile
  * @returns {Promise}
  */
 export const getCurrentUserProfile = () => axios.get('/me');
 