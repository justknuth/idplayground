import React, { useState, useEffect } from 'react';
import './ROITicker.css';

export interface ROITickerProps {
  /** The starting dollar amount saved */
  initialAmount: number;
}

export const ROITicker: React.FC<ROITickerProps> = ({ initialAmount }) => {
  const [amount, setAmount] = useState<number>(initialAmount);

  useEffect(() => {
    // Labor rate: $84/hour
    // Per second: 84 / 3600 = $0.023333...
    const ratePerSecond = 84 / 3600;
    
    // Update every second
    const intervalId = setInterval(() => {
      setAmount((prev) => prev + ratePerSecond);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Format as currency, ensuring 2 decimal places
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <div className="roi-display" title="Calculated at $84/hr developer rate">
      {formattedAmount}
    </div>
  );
};
