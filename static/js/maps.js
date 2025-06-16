/**
 * Maps utility functions for ShareMeal application
 * Handles Google Maps integration and location services
 */

class ShareMealMaps {
    constructor() {
        this.map = null;
        this.markers = [];
        this.infoWindow = null;
        this.geocoder = null;
        this.userMarker = null;
    }

    /**
     * Initialize Google Maps with default settings
     */
    init(containerId, options = {}) {
        const defaultOptions = {
            zoom: 13,
            center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
            styles: this.getDarkTheme()
        };

        const mapOptions = { ...defaultOptions, ...options };
        
        this.map = new google.maps.Map(document.getElementById(containerId), mapOptions);
        this.infoWindow = new google.maps.InfoWindow();
        this.geocoder = new google.maps.Geocoder();

        return this.map;
    }

    /**
     * Get dark theme styles for Google Maps
     */
    getDarkTheme() {
        return [
            {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#242f3e"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#746855"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#242f3e"}]
            },
            {
                "featureType": "administrative.locality",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#d59563"}]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#d59563"}]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [{"color": "#263c3f"}]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#6b9a76"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{"color": "#38414e"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#212a37"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#9ca5b3"}]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{"color": "#746855"}]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#1f2835"}]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#f3d19c"}]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [{"color": "#2f3948"}]
            },
            {
                "featureType": "transit.station",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#d59563"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#17263c"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#515c6d"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#17263c"}]
            }
        ];
    }

    /**
     * Add a marker to the map
     */
    addMarker(lat, lng, options = {}) {
        const defaultOptions = {
            position: { lat: lat, lng: lng },
            map: this.map,
            animation: google.maps.Animation.DROP
        };

        const markerOptions = { ...defaultOptions, ...options };
        const marker = new google.maps.Marker(markerOptions);
        
        this.markers.push(marker);
        return marker;
    }

    /**
     * Add a food listing marker
     */
    addFoodMarker(listing, onClick = null) {
        const marker = this.addMarker(listing.latitude, listing.longitude, {
            title: listing.title,
            icon: this.getFoodIcon(listing.food_type)
        });

        // Add click listener
        marker.addListener('click', () => {
            if (onClick) {
                onClick(marker, listing);
            } else {
                this.showFoodInfoWindow(marker, listing);
            }
        });

        return marker;
    }

    /**
     * Get icon for food type
     */
    getFoodIcon(foodType) {
        const icons = {
            'prepared': '🍽️',
            'raw': '🥬',
            'packaged': '📦'
        };

        const emoji = icons[foodType] || '🍽️';
        
        return {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="14" fill="#28a745" stroke="#fff" stroke-width="2"/>
                    <text x="16" y="21" text-anchor="middle" fill="white" font-family="Arial" font-size="14">${emoji}</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
        };
    }

    /**
     * Get user location icon
     */
    getUserIcon() {
        return {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="14" fill="#007bff" stroke="#fff" stroke-width="2"/>
                    <circle cx="16" cy="16" r="6" fill="#fff"/>
                    <circle cx="16" cy="16" r="3" fill="#007bff"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
        };
    }

    /**
     * Show info window for food listing
     */
    showFoodInfoWindow(marker, listing) {
        const expiryDate = new Date(listing.expiry_time);
        const content = `
            <div style="max-width: 300px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="border-bottom: 1px solid #dee2e6; padding-bottom: 8px; margin-bottom: 12px;">
                    <h6 style="margin: 0; color: #212529;">${listing.title}</h6>
                    <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">Available</span>
                </div>
                
                ${listing.description ? `<p style="margin: 0 0 12px 0; color: #6c757d; font-size: 0.875rem;">${listing.description.substring(0, 100)}${listing.description.length > 100 ? '...' : ''}</p>` : ''}
                
                <div style="margin-bottom: 12px;">
                    <div style="margin-bottom: 4px;"><strong>Type:</strong> ${listing.food_type.charAt(0).toUpperCase() + listing.food_type.slice(1)}</div>
                    <div style="margin-bottom: 4px;"><strong>Category:</strong> ${listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}</div>
                    <div style="margin-bottom: 4px;"><strong>Quantity:</strong> ${listing.quantity}</div>
                    <div style="margin-bottom: 4px;"><strong>Expires:</strong> ${expiryDate.toLocaleDateString()} ${expiryDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                
                <div style="margin-bottom: 12px; color: #6c757d; font-size: 0.875rem;">
                    <div style="margin-bottom: 4px;"><strong>Pickup:</strong> ${listing.pickup_location}</div>
                    <div><strong>Hotel:</strong> ${listing.hotel_name}</div>
                </div>
                
                <div style="text-align: center;">
                    <a href="/food/${listing.id}" style="background: #007bff; color: white; padding: 6px 16px; border-radius: 4px; text-decoration: none; font-size: 0.875rem;">View Details</a>
                </div>
            </div>
        `;
        
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
    }

    /**
     * Add user location marker
     */
    addUserMarker(lat, lng) {
        if (this.userMarker) {
            this.userMarker.setMap(null);
        }

        this.userMarker = this.addMarker(lat, lng, {
            title: 'Your Location',
            icon: this.getUserIcon(),
            zIndex: 1000
        });

        return this.userMarker;
    }

    /**
     * Clear all markers
     */
    clearMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
    }

    /**
     * Fit map to show all markers
     */
    fitBounds(includeUser = true) {
        if (this.markers.length === 0 && !this.userMarker) return;

        const bounds = new google.maps.LatLngBounds();
        
        this.markers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });

        if (includeUser && this.userMarker) {
            bounds.extend(this.userMarker.getPosition());
        }

        this.map.fitBounds(bounds);

        // Ensure minimum zoom level
        google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
            if (this.map.getZoom() > 15) {
                this.map.setZoom(15);
            }
        });
    }

    /**
     * Geocode an address
     */
    geocodeAddress(address) {
        return new Promise((resolve, reject) => {
            this.geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK') {
                    const location = results[0].geometry.location;
                    resolve({
                        lat: location.lat(),
                        lng: location.lng(),
                        formatted_address: results[0].formatted_address
                    });
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
    }

    /**
     * Get current user location
     */
    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                error => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 600000 // 10 minutes
                }
            );
        });
    }

    /**
     * Calculate distance between two points
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Set map center and zoom
     */
    setCenter(lat, lng, zoom = 13) {
        this.map.setCenter({ lat: lat, lng: lng });
        this.map.setZoom(zoom);
    }

    /**
     * Add click listener to map
     */
    addClickListener(callback) {
        this.map.addListener('click', callback);
    }

    /**
     * Get map instance
     */
    getMap() {
        return this.map;
    }

    /**
     * Destroy map and clean up
     */
    destroy() {
        this.clearMarkers();
        if (this.userMarker) {
            this.userMarker.setMap(null);
        }
        if (this.infoWindow) {
            this.infoWindow.close();
        }
        this.map = null;
    }
}

// Export for use in other scripts
window.ShareMealMaps = ShareMealMaps;
