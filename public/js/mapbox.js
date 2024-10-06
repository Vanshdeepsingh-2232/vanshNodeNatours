// // Initialize the map

// export function initializeMap() {
//   const map = new maplibregl.Map({
//     container: 'map',
//     style:
//       'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
//     center: [-87.62712, 41.89033], // Initial center (Chicago)
//     zoom: 15.5,
//     pitch: 45,
//   });

//   // Coordinates of multiple markers (lat, long)
//   // const markers = [
//   //   [-87.62712, 41.89033], // Initial marker (Chicago)
//   //   [-87.631, 41.892], // Example marker 1
//   //   [-87.62, 41.895], // Exa
//   //   [-87.63, 41.888], // Example marker 3
//   // ];

//   // Add markers to the map
//   // markers.forEach((coord) => {
//   //   new maplibregl.Marker().setLngLat(coord).addTo(map);
//   // });

//   // Retrieve locations from data attribute
  

//   // Function to rotate the camera around the initial marker
//   function rotateCamera(timestamp) {
//     map.rotateTo((timestamp / 100) % 360, { duration: 0 });
//     requestAnimationFrame(rotateCamera);
//   }

//   // Function to animate the camera to each marker one by one
//   function flyToMarkers(markerIndex) {
//     if (markerIndex < markers.length) {
//       // Fly to the current marker
//       map.flyTo({
//         center: markers[markerIndex],
//         zoom: 16,
//         pitch: 45,
//         bearing: 0,
//         duration: 2000, // 2 seconds to fly to each marker
//       });

//       // Set timeout to fly to the next marker after 3 seconds (includes fly time)
//       setTimeout(() => {
//         flyToMarkers(markerIndex + 1);
//       }, 3000); // Wait 3 seconds before going to the next marker
//     } else {
//       // After visiting all markers, return to the initial marker
//       returnToInitialMarker();
//     }
//   }

//   // Return to the initial marker and start rotating around it
//   function returnToInitialMarker() {
//     const initialMarker = markers[0]; // First marker in the array
//     map.flyTo({
//       center: initialMarker,
//       zoom: 15.5,
//       pitch: 45,
//       bearing: 0, // Reset the bearing
//       duration: 2000, // Animate over 2 seconds
//     });

//     // Start rotating the camera after reaching the initial marker
//     setTimeout(() => {
//       rotateCamera(0);
//     }, 2000); // Delay rotation to allow flyTo animation to complete
//   }

//   // Wait for the map to load
//   map.on('load', () => {
//     // Start animating the camera to each marker
//     flyToMarkers(0); // Start from the first marker
//   });
// }

export function initializeMap() {
  const map = new maplibregl.Map({
    container: 'map',
    style:
      'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    center: [-87.62712, 41.89033], // Initial center (Chicago)
    zoom: 15.5,
    pitch: 45,
  });

  // Retrieve locations from the data attribute and parse it
  const locations = JSON.parse(document.getElementById('map').getAttribute('data-locations'));

  // Coordinates of multiple markers (lat, long) from parsed locations
  const markers = locations.map((loc) => loc.coordinates);

  // Add markers to the map
  locations.forEach((loc) => {
    new maplibregl.Marker()
      .setLngLat(loc.coordinates)
      .setPopup(new maplibregl.Popup().setText(loc.description)) // Add description as a popup
      .addTo(map);
  });

  // Function to rotate the camera around the initial marker
  function rotateCamera(timestamp) {
    map.rotateTo((timestamp / 100) % 360, { duration: 0 });
    requestAnimationFrame(rotateCamera);
  }

  // Function to animate the camera to each marker one by one
  function flyToMarkers(markerIndex) {
    if (markerIndex < markers.length) {
      // Fly to the current marker
      map.flyTo({
        center: markers[markerIndex],
        zoom: 16,
        pitch: 45,
        bearing: 0,
        duration: 2000, // 2 seconds to fly to each marker
      });

      // Set timeout to fly to the next marker after 3 seconds (includes fly time)
      setTimeout(() => {
        flyToMarkers(markerIndex + 1);
      }, 3000); // Wait 3 seconds before going to the next marker
    } else {
      // After visiting all markers, return to the initial marker
      returnToInitialMarker();
    }
  }

  // Return to the initial marker and start rotating around it
  function returnToInitialMarker() {
    const initialMarker = markers[0]; // First marker in the array
    map.flyTo({
      center: initialMarker,
      zoom: 15.5,
      pitch: 45,
      bearing: 0, // Reset the bearing
      duration: 2000, // Animate over 2 seconds
    });

    // Start rotating the camera after reaching the initial marker
    setTimeout(() => {
      rotateCamera(0);
    }, 2000); // Delay rotation to allow flyTo animation to complete
  }

  // Wait for the map to load
  map.on('load', () => {
    // Start animating the camera to each marker
    flyToMarkers(0); // Start from the first marker
  });
}
