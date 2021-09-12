import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Hits,
  SearchBox,
  Pagination,
  Highlight,
} from 'react-instantsearch-dom';
import PropTypes from 'prop-types';
import './App.css';

const searchClient = algoliasearch('osobisty-search-ui', '6be0576ff61c053d5f9a3225e2a90f76');

function App() {
  return (
    <div>
      <header className="header">
        <h1 className="header-title">
          <a href="/">search-ui</a>
        </h1>
        <p className="header-subtitle">
          using{' '}
          <a href="https://github.com/algolia/react-instantsearch">
            React InstantSearch
          </a>
        </p>
      </header>

      <div className="container">
        <InstantSearch searchClient={searchClient} indexName="zettleDocuments">
          <div className="search-panel">
            <div className="search-panel__results">
              <SearchBox
                className="searchbox"
                translations={{
                  placeholder: '',
                }}
              />
              <Hits hitComponent={Hit} />

              <div className="pagination">
                <Pagination />
              </div>
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}

function Hit(props) {
  return (
    <article>
      <h1>
        <Highlight attribute="title" hit={props.hit} />
      </h1>
      <p>
        <Highlight attribute="name" hit={props.hit} />
      </p>
      <p>
        <Highlight attribute="description" hit={props.hit} />
      </p>
    </article>
  );
}

Hit.propTypes = {
  hit: PropTypes.object.isRequired,
};

export default App;
