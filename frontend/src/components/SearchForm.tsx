import React, { useState } from 'react';
import { MapPin, Calendar, Users, RotateCcw } from 'lucide-react';
import { SearchHotelsParams } from '../api/types';
import { useHotelStore } from '../store/useHotelStore';
import { useUrlRouting } from '../hooks/useUrlRouting';
import { InputField } from './common/InputField';
import { CustomSelect } from './common/CustomSelect';
import {
  PAGE_STRINGS,
  VALIDATION_REGEX,
  VALIDATION_MESSAGES,
  GUEST_OPTIONS,
  isRecognizedDestination,
} from '../constants/appConsts';
import { sanitizeInput } from '../utils/utilityManager';

export { GUEST_OPTIONS };

interface SearchFormProps {
  onSearch: (params: SearchHotelsParams) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const {
    city,
    setCity,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    resetForm,
  } = useHotelStore();

  const { syncSearchToUrl } = useUrlRouting();
  const [cityError, setCityError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const cleanCity = sanitizeInput(city);
    if (!cleanCity) {
      setCityError(VALIDATION_MESSAGES.cityRequired);
      return;
    }
    if (!VALIDATION_REGEX.city.test(cleanCity)) {
      setCityError(VALIDATION_MESSAGES.cityInvalid);
      return;
    }
    if (!isRecognizedDestination(cleanCity)) {
      setCityError(VALIDATION_MESSAGES.cityNotFound);
      return;
    }

    setCityError(null);
    const effectiveCity = cleanCity;
    const effectiveCheckIn = sanitizeInput(checkIn) || new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const effectiveCheckOut = sanitizeInput(checkOut) || tomorrow.toISOString().split('T')[0];
    const effectiveGuests = sanitizeInput(guests) || '2 Adults';

    syncSearchToUrl({
      city: effectiveCity,
      checkIn: effectiveCheckIn,
      checkOut: effectiveCheckOut,
      guests: parseInt(effectiveGuests, 10) || 2,
    });

    onSearch({
      city: effectiveCity,
      checkIn: effectiveCheckIn,
      checkOut: effectiveCheckOut,
      guests: effectiveGuests,
    });

    // Scroll to results
    setTimeout(() => {
      const resultsEl =
        document.getElementById('search-results') ||
        document.querySelector('.search-results-section');
      if (resultsEl) {
        const targetTop =
          resultsEl.getBoundingClientRect().top + window.pageYOffset - 24;
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth',
        });
      }
    }, 150);
  };

  return (
    <div className="search-form-card" data-testid="search-panel">
      <form onSubmit={handleSubmit} data-testid="search-form">
        {/* Form Grid */}
        <div className="search-bar-grid">
          {/* Destination */}
          <div className="search-col">
            <InputField
              id="city-input"
              label={PAGE_STRINGS.searchForm.destinationLabel}
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (cityError) setCityError(null);
              }}
              error={cityError || undefined}
              placeholder={PAGE_STRINGS.searchForm.destinationPlaceholder}
              icon={<MapPin size={16} />}
              disabled={isLoading}
            />
          </div>

          {/* Check-In */}
          <div className="search-col">
            <InputField
              id="checkin-input"
              label={PAGE_STRINGS.searchForm.checkInLabel}
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              placeholder={PAGE_STRINGS.searchForm.checkInPlaceholder}
              icon={<Calendar size={16} />}
              disabled={isLoading}
            />
          </div>

          {/* Check-Out */}
          <div className="search-col">
            <InputField
              id="checkout-input"
              label={PAGE_STRINGS.searchForm.checkOutLabel}
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              placeholder={PAGE_STRINGS.searchForm.checkOutPlaceholder}
              icon={<Calendar size={16} />}
              disabled={isLoading}
            />
          </div>

          {/* Guests */}
          <div className="search-col">
            <CustomSelect
              id="guests-select"
              label={PAGE_STRINGS.searchForm.guestsLabel}
              options={GUEST_OPTIONS}
              value={guests}
              placeholder={PAGE_STRINGS.searchForm.guestsPlaceholder}
              onChange={(val) => setGuests(val)}
              icon={<Users size={16} />}
              disabled={isLoading}
            />
          </div>

          {/* Search Button */}
          <div className="search-btn-col">
            <button
              type="submit"
              className="btn-search-hotels"
              disabled={isLoading}
              data-testid="submit-search-btn"
            >
              {isLoading ? PAGE_STRINGS.searchForm.submittingButtonShort : PAGE_STRINGS.searchForm.submitButtonShort}
            </button>
          </div>
        </div>

        {/* Form Footer */}
        <div className="search-form-footer">
          <button
            type="button"
            className="sim-reset-btn"
            onClick={() => {
              setCityError(null);
              resetForm();
            }}
            disabled={isLoading}
            title={PAGE_STRINGS.searchForm.resetButton}
            data-testid="reset-form-btn"
          >
            <RotateCcw size={13} /> {PAGE_STRINGS.searchForm.resetButton}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
