import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

import './Map.css';
 
mapboxgl.accessToken = process.env.REACT_APP_MAP_KEY;

const Map = props => {
  const { center, zoom } = props;
  const mapRef = useRef();
  useEffect(() => {
    new mapboxgl.Map({
      container: "map",
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [center.lng, center.lat], 
      zoom: zoom
    });
  }, [center, zoom]);
 
  return (
    <div
      ref={mapRef}
      className={`map ${props.className}`}
      style={props.style}
      id="map"
    ></div>
  );
};
 
export default Map;