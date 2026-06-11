'use client';

const CRICKET_COUNTRIES = [
  'India', 'Australia', 'England', 'South Africa', 'New Zealand', 
  'Pakistan', 'Sri Lanka', 'West Indies', 'Bangladesh', 'Afghanistan',
  'Ireland', 'Zimbabwe', 'Netherlands', 'Scotland', 'Nepal'
];

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CountrySelect({ value, onChange, className = '' }: CountrySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input-field appearance-none cursor-pointer bg-stadium-darker ${className}`}
      required
    >
      <option value="" disabled>Select Country</option>
      <optgroup label="Major Cricket Nations">
        {CRICKET_COUNTRIES.map(country => (
          <option key={country} value={country}>{country}</option>
        ))}
      </optgroup>
      <optgroup label="Other">
        <option value="Other">Other</option>
      </optgroup>
    </select>
  );
}
