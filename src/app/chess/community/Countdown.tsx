"use client";

import { useState, useEffect } from 'react';

export default function Countdown({ targetDate }: { targetDate: Date }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex justify-center gap-4 font-mono text-3xl font-bold">
      <div>{String(timeLeft.days).padStart(2, '0')}d</div>
      <div>{String(timeLeft.hours).padStart(2, '0')}h</div>
      <div>{String(timeLeft.minutes).padStart(2, '0')}m</div>
      <div>{String(timeLeft.seconds).padStart(2, '0')}s</div>
    </div>
  );
}
