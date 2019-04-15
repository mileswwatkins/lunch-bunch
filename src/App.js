import React, {Component} from 'react'
import {InfoWindow, Map, Marker} from 'google-maps-react'
import {debounce} from 'lodash'
import './App.css'

class MapContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      infoWindowVisible: false,
      activeRestaurant: null,
      activeMarker: null
    }

    this.onMarkerClick = this.onMarkerClick.bind(this)
    this.onMapClick = this.onMapClick.bind(this)
  }

  onMarkerClick(markerProps, marker) {
    if (!this.state.activeMarker || this.state.activeMarker === marker) {
      this.setState({
        infoWindowVisible: !this.state.infoWindowVisible,
        activeRestaurant: markerProps.name,
        activeMarker: marker
      })
    } else {
      this.setState({
        activeRestaurant: markerProps.name,
        activeMarker: marker
      })
    }
  }

  onMapClick() {
    if (this.state.infoWindowVisible) {
      this.setState({infoWindowVisible: false})
    }
  }

  render() {
    return (
      <div className='App-MapContainer'>
        <Map
          google={window.google}
          centerAroundCurrentLocation={true}
          // Zoom level 16 represents a relatively walkable radius,
          // appropriate for the core user story of this tool
          zoom={16}
          initialCenter={{lat: 37.79, lng: -122.41}}
          onReady={this.props.retrieveMap}
          onBounds_changed={debounce(this.props.handleMapBoundsChange, 500)}
          onClick={this.onMapClick}
          scrollwheel={false}
          // These map controls could be included in future
          // iterations, but would require further UX consideration
          // as to how they serve this relatively focused,
          // responsive web app
          fullscreenControl={false}
          mapTypeControl={false}
          streetViewControl={false}
        >
          {this.props.results.map(result =>
            <Marker
              key={result.place_id}
              name={result.name}
              position={result.geometry.location}
              icon={{url: `https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=${result.markerNumber}|FE6256`}}
              onClick={this.onMarkerClick}
            />
          )}
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.infoWindowVisible}
          >
            <div>
              <span>{this.state.activeRestaurant}</span>
            </div>
          </InfoWindow>
        </Map>
      </div>
    )
  }
}

class Search extends Component {
  constructor(props) {
    super(props)

    this.state = {input: ''}
    
    this.handleTextInput = this.handleTextInput.bind(this)
    this.performSearch = this.performSearch.bind(this)
  }

  handleTextInput(e) {
    this.setState({input: e.target.value})
  }

  performSearch(e) {
    if (e) {e.preventDefault()}

    this.props.placesService.textSearch(
      {
        query: this.state.input,
        type: 'restaurant',
        bounds: this.props.mapBounds
      },
      this.props.handleSearchResults
    )
  }

  componentDidUpdate(previousProps) {
    // When the search service first becomes available,
    // run a query on all restaurants within the map bounds
    if (!previousProps.placesService && this.props.placesService) {
      this.performSearch()
    }

    if (previousProps.mapBounds !== this.props.mapBounds) {
      this.performSearch()
    }
  }

  render() {
    return (
      <div className="App-header-Search" onSubmit={this.performSearch}>
        <form className="App-header-Search-form">
          <input
            type="text"
            className="App-header-Search-input"
            placeholder="Search your nearby restaurants"
            value={this.state.input}
            onChange={this.handleTextInput}
          />
          <input type="submit" value="Search" className="App-header-Search-button" />
        </form>
      </div>
    )
  }
}

class Restaurant extends Component {
  makeURL(name, address) {
    // In future development cycles, this can be replaced
    // with a call to the Google Place Details API, or an
    // additional view with detailed Place information
    const queryParameter = window.encodeURIComponent(`${name} ${address}`)
    return `https://www.google.com/search?q=${queryParameter}`
  }

  render() {
    return (
      <div className="App-Restaurant">
        <h3 className="App-Restaurant-title">
          {`${this.props.markerNumber}. `}
          <a href={this.makeURL(this.props.name, this.props.address)} target={'_blank'}>
            {this.props.name}
          </a>
        </h3>
        <span className="App-Restaurant-info">Rating: {this.props.rating} / 5</span>
        <span className="App-Restaurant-info">{this.props.address}</span>
      </div>
    )
  }
}

class Restaurants extends Component {
  render() {
    return (
      <div className="App-Restaurants">
        {this.props.results.map(result =>
          <Restaurant
            key={result.place_id}
            markerNumber={result.markerNumber}
            name={result.name}
            rating={result.rating}
            address={result.formatted_address}
          />
        )}
      </div>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      results: [],
      map: null,
      mapBounds: null,
      placesService: null
    }

    this.handleSearchResults = this.handleSearchResults.bind(this)
    this.retrieveMap = this.retrieveMap.bind(this)
    this.handleMapBoundsChange = this.handleMapBoundsChange.bind(this)
  }

  retrieveMap(mapProps, map) {
    this.setState(
      {map: map},
      () => {this.setState({
        placesService: new window.google.maps.places.PlacesService(this.state.map)
      })}
    )
  }

  handleSearchResults(results) {
    this.setState({
      results: results
        // Currently, only display a maximum of nine results;
        // increase this via pagination in a future dev cycle
        .slice(0, 9)
        // Identify the Google Maps marker icon. The icon URL
        // will be generated within the map element.
        .map((r, index) => {
          r.markerNumber = index + 1
          return r
        })
    })
  }

  handleMapBoundsChange() {
    // Unfortunately, the Google Maps `bounds_changed` event
    // doesn't return the bounds value.
    // This function is debounced in the prop assignment to
    // avoid too-frequent calls.
    this.setState({mapBounds: this.state.map.getBounds()})
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-header-title">
            <span role="img" aria-label="food emoji">🍔</span>
            {' Lunch Bunch '}
            <span role="img" aria-label="food emoji">🍲</span>
          </h1>
          <span className="App-header-description">
            Find the hot new hot food near you!
          </span>
          <Search
            handleSearchResults={this.handleSearchResults}
            placesService={this.state.placesService}
            mapBounds={this.state.mapBounds}
          />
        </header>

        <div className="App-content">
          <MapContainer
            map={this.state.map}
            retrieveMap={this.retrieveMap}
            handleMapBoundsChange={this.handleMapBoundsChange}
            results={this.state.results}
          />
          <Restaurants
            results={this.state.results}
          />
        </div>
      </div>
    )
  }
}

export default App
