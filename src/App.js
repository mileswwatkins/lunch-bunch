import React, { Component } from 'react'
import './App.css'

class Map extends Component {
  render() {
    return (
      <div className="App-Map">
        MAP
      </div>
    )
  }
}

class Search extends Component {
  constructor(props) {
    super(props)
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
  }

  handleFormSubmit(e) {
    e.preventDefault()

    console.log(e)
  }

  render() {
    return (
      <div className="App-header-Search" onSubmit={this.handleFormSubmit}>
        <form className="App-header-Search-form">
          <input
            type="text"
            name="search"
            className="App-header-Search-input"
            placeholder="Search by name or cuisine"
          />
          <input type="submit" value="Search" className="App-header-Search-button" />
        </form>
      </div>
    )
  }
}

class Restaurant extends Component {
  render() {
    return (
      <div className="App-Restaurant">
        <h3>
          <a href="https://google.com">
            {this.props.name}
          </a>
        </h3>
        <span className="App-Restaurant-info">Cuisine type</span>
        <span className="App-Restaurant-info">Rating</span>
        <span className="App-Restaurant-info">Address</span>
      </div>
    )
  }
}

class Restaurants extends Component {
  render() {
    return (
      <div className="App-Restaurants">
        {this.props.items.map(item =>
          <Restaurant
            key={item}
            name={item}
          />
        )}
      </div>
    )
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-header-title">
            Lunch Search
          </h1>
          <span className="App-header-description">
            Find the hot new hot food near you!
          </span>

          <Search />
        </header>

        <div className="App-content">
          <Map />
          <Restaurants
            items={['foo', 'bar', 'baz']}
          />
        </div>
      </div>
    )
  }
}

export default App
