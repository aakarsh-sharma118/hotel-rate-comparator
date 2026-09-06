import React, { useEffect } from 'react';
import {
  Heart,
  Star,
  MapPin,
  Grid,
  List,
  AlertCircle,
  ArrowUpDown,
  Check,
  ShieldCheck,
  Sparkles,
  Filter,
  SearchX,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { HotelListSkeleton } from './skeletons/HotelListSkeleton';
import { SearchWorkflowResult, HotelCardData } from '../api/types';
import { useHotelStore, SortOption } from '../store/useHotelStore';
import { useTheme } from '../hooks/useTheme';
import { PAGE_STRINGS, SORT_OPTIONS } from '../constants/appConsts';
import { formatPriceINR } from '../utils/utilityManager';
import { CustomSelect } from './common/CustomSelect';

interface SearchResultsListProps {
  isLoading: boolean;
  result: SearchWorkflowResult | null;
  error: string | null;
  city: string;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  isLoading,
  result,
  error,
  city,
}) => {
  const {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    supplierFilter,
    setSupplierFilter,
    amenityFilter,
    setAmenityFilter,
    favorites,
    toggleFavorite,
    openBookingModal,
    selectDestination,
    resetForm,
    backendHotels,
    isLoadingCatalog,
    fetchCatalogForCity,
  } = useHotelStore();

  const { isDark } = useTheme();

  const displayCity = city.trim() || result?.city || 'Goa';

  // Fetch hotel inventory
  useEffect(() => {
    if (backendHotels.length === 0 && !result && !isLoading) {
      fetchCatalogForCity(displayCity);
    }
  }, [displayCity, backendHotels.length, result, isLoading, fetchCatalogForCity]);

  // Empty results check
  const isNoResultsFound = Boolean(
    result &&
      (result.status === 'NO_HOTELS_FOUND' ||
        (result.status === 'SUCCESS' && (!result.allOffers || result.allOffers.length === 0)))
  );

  // Hotel card data
  const hotelCards: HotelCardData[] = (result && result.hotels && result.hotels.length > 0)
    ? result.hotels
    : backendHotels;

  // Supplier filter
  let filteredHotels = hotelCards;
  if (supplierFilter !== 'ALL') {
    filteredHotels = filteredHotels.filter(
      (h) => h.cheaperSupplier === supplierFilter
    );
  }

  // Amenity filter
  if (amenityFilter) {
    filteredHotels = filteredHotels.filter((h) =>
      h.amenities.some((a) => a.toLowerCase().includes(amenityFilter.toLowerCase()))
    );
  }

  // Favorites filter
  if (sortBy === 'favorites') {
    filteredHotels = filteredHotels.filter((h) => favorites[h.hotelId] === true);
  }

  // Sorting
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortBy === 'cheapest' || sortBy === 'favorites') return a.price - b.price;
    if (sortBy === 'stars') return b.stars - a.stars;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const showLoadingSkeleton = isLoading || (isLoadingCatalog && hotelCards.length === 0);

  return (
    <section id="search-results" className="search-results-section" data-testid="search-results-list">
      {/* Section Header */}
      <div className="results-header-container">
        <div className="results-header-left">
          <div className="results-title-badge-row">
            <h2 className="results-title">{PAGE_STRINGS.results.heading}</h2>
            <span className="results-currency-badge">
              Prices in {PAGE_STRINGS.currency.symbol} ({PAGE_STRINGS.currency.code})
            </span>
          </div>
          <p className="results-subheading">{PAGE_STRINGS.results.subheading}</p>
        </div>
      </div>

      {/* Filters and Sorting */}
      {!showLoadingSkeleton && !error && !isNoResultsFound && (
        <div className="results-filters-bar">
          {/* Supplier Filter */}
          <div className="filter-pill-group">
            <span className="filter-label">
              <Filter size={13} /> {PAGE_STRINGS.results.filters.providerLabel}
            </span>
            <button
              type="button"
              className={`filter-pill-btn ${supplierFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setSupplierFilter('ALL')}
            >
              {PAGE_STRINGS.results.filters.allProviders}
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${supplierFilter === 'Supplier A' ? 'active' : ''}`}
              onClick={() => setSupplierFilter('Supplier A')}
            >
              {PAGE_STRINGS.results.filters.supplierAOnly}
            </button>
            <button
              type="button"
              className={`filter-pill-btn ${supplierFilter === 'Supplier B' ? 'active' : ''}`}
              onClick={() => setSupplierFilter('Supplier B')}
            >
              {PAGE_STRINGS.results.filters.supplierBOnly}
            </button>
          </div>

          {/* Amenity Filter */}
          <div className="filter-amenities-group">
            <button
              type="button"
              className={`amenity-filter-btn ${amenityFilter === 'Cancellation' ? 'active' : ''}`}
              onClick={() => setAmenityFilter(amenityFilter === 'Cancellation' ? null : 'Cancellation')}
            >
              {PAGE_STRINGS.results.filters.freeCancellation}
            </button>
            <button
              type="button"
              className={`amenity-filter-btn ${amenityFilter === 'Breakfast' ? 'active' : ''}`}
              onClick={() => setAmenityFilter(amenityFilter === 'Breakfast' ? null : 'Breakfast')}
            >
              {PAGE_STRINGS.results.filters.breakfastIncluded}
            </button>
          </div>

          {/* View Mode Controls */}
          <div className="sort-view-controls">
            <div className="sort-dropdown-wrap">
              <CustomSelect
                id="sort-hotels-select"
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val as SortOption)}
                icon={<ArrowUpDown size={14} color="#64748b" />}
              />
            </div>

            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title={PAGE_STRINGS.results.gridViewLabel}
                aria-label={PAGE_STRINGS.results.gridViewLabel}
              >
                <Grid size={15} />
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title={PAGE_STRINGS.results.listViewLabel}
                aria-label={PAGE_STRINGS.results.listViewLabel}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {showLoadingSkeleton && (
        <HotelListSkeleton count={3} viewMode={viewMode} isDark={isDark} />
      )}

      {/* Error Alert */}
      {!showLoadingSkeleton && error && (
        <div className="results-alert alert-error" data-testid="error-banner">
          <AlertCircle size={22} />
          <div>
            <strong>{PAGE_STRINGS.results.searchInterrupted}</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!showLoadingSkeleton && !error && isNoResultsFound && (
        <div className="empty-results-card" data-testid="no-results-found">
          <div className="empty-icon-wrap">
            <SearchX size={36} />
          </div>
          <h3 className="empty-title">
            {PAGE_STRINGS.results.emptyState.title} in {displayCity}
          </h3>
          <p className="empty-subtitle">{PAGE_STRINGS.results.emptyState.subtitle}</p>
          <p className="empty-desc">{PAGE_STRINGS.results.emptyState.description}</p>

          <div className="empty-suggestions">
            <span className="suggestions-title">
              <Compass size={14} /> {PAGE_STRINGS.results.emptyState.popularCitiesTitle}
            </span>
            <div className="suggestions-pills">
              {PAGE_STRINGS.results.emptyState.popularCities.map((cityName) => (
                <button
                  key={cityName}
                  type="button"
                  className="suggestion-pill"
                  onClick={() => selectDestination(cityName)}
                >
                  <MapPin size={12} /> {cityName}
                </button>
              ))}
            </div>
          </div>

          <div className="empty-actions">
            <button
              type="button"
              className="btn-empty-reset"
              onClick={resetForm}
            >
              <RotateCcw size={15} /> {PAGE_STRINGS.results.emptyState.resetButton}
            </button>
          </div>
        </div>
      )}

      {/* Empty Filter State */}
      {!showLoadingSkeleton && !error && !isNoResultsFound && sortedHotels.length === 0 && (
        sortBy === 'favorites' ? (
          <div className="results-alert alert-empty" data-testid="empty-favorites-banner">
            <Heart size={24} color="#ef4444" />
            <div>
              <strong>{PAGE_STRINGS.results.favoritesEmptyTitle}</strong>
              <p>{PAGE_STRINGS.results.favoritesEmptyDesc}</p>
            </div>
          </div>
        ) : (
          <div className="empty-results-card" data-testid="empty-filters-banner" style={{ padding: '2.5rem 1.5rem' }}>
            <div className="empty-icon-wrap" style={{ width: '56px', height: '56px', marginBottom: '1rem' }}>
              <Filter size={26} />
            </div>
            <h3 className="empty-title" style={{ fontSize: '1.25rem' }}>
              {PAGE_STRINGS.results.emptyState.filterEmptyTitle}
            </h3>
            <p className="empty-desc" style={{ maxWidth: '480px', marginBottom: '1.25rem' }}>
              {PAGE_STRINGS.results.emptyState.filterEmptyDesc}
            </p>
            <div className="empty-actions">
              <button
                type="button"
                className="btn-empty-reset"
                onClick={() => {
                  setSupplierFilter('ALL');
                  setAmenityFilter(null);
                }}
              >
                <RotateCcw size={15} /> {PAGE_STRINGS.results.emptyState.clearFiltersButton}
              </button>
            </div>
          </div>
        )
      )}

      {/* Hotel Cards */}
      {!showLoadingSkeleton && !error && !isNoResultsFound && sortedHotels.length > 0 && (
        <div className={viewMode === 'list' ? 'hotel-cards-list-view' : 'hotel-cards-grid'}>
          {sortedHotels.map((hotel, index) => {
            const isFav = Boolean(favorites[hotel.hotelId]);
            const isWinnerA = hotel.cheaperSupplier === 'Supplier A';

            if (viewMode === 'list') {
              // Horizontal card layout
              return (
                <article
                  key={hotel.hotelId}
                  className="hotel-card horizontal-card"
                  data-testid={`hotel-card-${index}`}
                >
                  {/* Image Column */}
                  <div className="horizontal-img-wrap">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="hotel-img"
                      loading="lazy"
                    />
                    <span className="verified-deal-badge">
                      <ShieldCheck size={12} /> {PAGE_STRINGS.results.bestRateBadge}
                    </span>
                    <button
                      type="button"
                      className={`hotel-fav-btn ${isFav ? 'active' : ''}`}
                      onClick={() => toggleFavorite(hotel.hotelId)}
                      aria-label={PAGE_STRINGS.results.saveFavoritesLabel}
                    >
                      <Heart
                        size={17}
                        fill={isFav ? '#ef4444' : 'none'}
                        color={isFav ? '#ef4444' : '#222222'}
                      />
                    </button>
                  </div>

                  {/* Details Column */}
                  <div className="horizontal-content-col">
                    <div className="horizontal-header-row">
                      <div>
                        <h3 className="hotel-name">{hotel.name}</h3>
                        <div className="hotel-location">
                          <MapPin size={13} />
                          <span>{hotel.location}</span>
                        </div>
                      </div>
                      <div className="hotel-stars" title={`${hotel.stars} stars`}>
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    </div>

                    <div className="hotel-amenities-tags">
                      {hotel.amenities.map((amenity, i) => (
                        <span key={i} className="amenity-chip">
                          <Check size={11} className="amenity-check" /> {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Rate Comparison */}
                    <div className="horizontal-rate-compare">
                      <div className="compare-item">
                        <span className="compare-supplier-name">{PAGE_STRINGS.results.supplierA}</span>
                        <span className={`compare-price ${isWinnerA ? 'cheapest' : ''}`}>
                          ₹{formatPriceINR(hotel.rateA)}
                        </span>
                      </div>
                      <div className="compare-vs">vs</div>
                      <div className="compare-item">
                        <span className="compare-supplier-name">{PAGE_STRINGS.results.supplierB}</span>
                        <span className={`compare-price ${!isWinnerA ? 'cheapest' : ''}`}>
                          ₹{formatPriceINR(hotel.rateB)}
                        </span>
                      </div>
                      <div className="compare-callout">
                        <Sparkles size={13} />
                        <strong>
                          {hotel.cheaperSupplier} {PAGE_STRINGS.results.savePrefix.toLowerCase()}s ₹{formatPriceINR(hotel.savings)}!
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & CTA Column */}
                  <div className="horizontal-action-col">
                    <span className="price-lead-label">
                      {PAGE_STRINGS.results.rateFrom} {hotel.cheaperSupplier}
                    </span>
                    <div className="price-display-box">
                      <span className="price-currency">₹</span>
                      <span className="price-figure">{formatPriceINR(hotel.price)}</span>
                      <span className="price-period">{PAGE_STRINGS.results.nightUnit}</span>
                    </div>
                    <span className="tax-notice">{PAGE_STRINGS.results.taxNotice}</span>
                    <button
                      type="button"
                      className="btn-book-hotel"
                      onClick={() =>
                        openBookingModal({
                          hotelId: hotel.hotelId,
                          name: hotel.name,
                          price: hotel.price,
                          supplier: hotel.cheaperSupplier,
                          location: hotel.location,
                          stars: hotel.stars,
                          image: hotel.image,
                        })
                      }
                    >
                      {PAGE_STRINGS.results.bookNow}
                    </button>
                  </div>
                </article>
              );
            }

            // Grid card layout
            return (
              <article key={hotel.hotelId} className="hotel-card" data-testid={`hotel-card-${index}`}>
                <div className="hotel-img-wrap">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="hotel-img"
                    loading="lazy"
                  />
                  <span className="deal-discount-pill">
                    {PAGE_STRINGS.results.savePrefix} ₹{formatPriceINR(hotel.savings)}
                  </span>
                  <button
                    type="button"
                    className={`hotel-fav-btn ${isFav ? 'active' : ''}`}
                    onClick={() => toggleFavorite(hotel.hotelId)}
                    aria-label={PAGE_STRINGS.results.saveFavoritesLabel}
                  >
                    <Heart
                      size={18}
                      fill={isFav ? '#ef4444' : 'none'}
                      color={isFav ? '#ef4444' : '#222222'}
                    />
                  </button>
                </div>

                <div className="hotel-card-body">
                  <div className="hotel-name-row">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <div className="hotel-stars" title={`${hotel.stars} stars`}>
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                  </div>

                  <div className="hotel-location">
                    <MapPin size={13} />
                    <span>{hotel.location}</span>
                  </div>

                  {/* Amenities */}
                  <div className="hotel-amenities-tags" style={{ marginBottom: '0.85rem' }}>
                    {hotel.amenities.slice(0, 2).map((amenity, i) => (
                      <span key={i} className="amenity-chip">
                        <Check size={11} className="amenity-check" /> {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="rate-comparison-row">
                    <div className="rate-col">
                      <span className="rate-col-label">{PAGE_STRINGS.results.supplierA}</span>
                      <span className={`rate-val ${isWinnerA ? 'cheapest' : ''}`}>
                        ₹{formatPriceINR(hotel.rateA)}
                      </span>
                    </div>

                    <div className="rate-col">
                      <span className="rate-col-label">{PAGE_STRINGS.results.supplierB}</span>
                      <span className={`rate-val ${!isWinnerA ? 'cheapest' : ''}`}>
                        ₹{formatPriceINR(hotel.rateB)}
                      </span>
                    </div>
                  </div>

                  <div className="comparison-badge-row">
                    <span className="compare-text">
                      {PAGE_STRINGS.results.bestDealLabel}{' '}
                      <strong className="winner-highlight">
                        {hotel.cheaperSupplier} {PAGE_STRINGS.results.winsLabel}
                      </strong>
                    </span>
                    <div className="supplier-avatars">
                      <span className="supplier-avatar avatar-a">A</span>
                      <span className="supplier-avatar avatar-b">B</span>
                    </div>
                  </div>

                  <div className="grid-price-row">
                    <div>
                      <span className="grid-rate-figure">
                        ₹{formatPriceINR(hotel.price)}
                      </span>
                      <span className="grid-rate-period"> {PAGE_STRINGS.results.nightUnit}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-book-hotel"
                      onClick={() =>
                        openBookingModal({
                          hotelId: hotel.hotelId,
                          name: hotel.name,
                          price: hotel.price,
                          supplier: hotel.cheaperSupplier,
                          location: hotel.location,
                          stars: hotel.stars,
                          image: hotel.image,
                        })
                      }
                    >
                      {PAGE_STRINGS.results.bookNow}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SearchResultsList;
