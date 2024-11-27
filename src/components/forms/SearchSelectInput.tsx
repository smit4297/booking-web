import React, { useState } from 'react';

export const SearchSelectInput = ({ label, value, onChange, placeholder }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStations = async (term) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stations?search=${encodeURIComponent(term)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }
      const data = await response.json();
      setFilteredOptions(data.stations || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      setFilteredOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchText(inputValue);

    if (inputValue.trim() === '') {
      setFilteredOptions([]);
      setShowDropdown(false);
      return;
    }

    fetchStations(inputValue);
    setShowDropdown(true);
  };

  const handleOptionSelect = (option) => {
    setSearchText(option);
    onChange(option);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200); // Delay to allow option click
  };

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={searchText}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
      />
      {showDropdown && (
        <div
          className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-md w-full max-h-40 overflow-y-auto"
        >
          {loading ? (
            <div className="px-3 py-2 text-gray-500">Loading...</div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionSelect(option)}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur on click
              >
                {option}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};
