"use client";

import { useState, useEffect } from 'react';

export default function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [sorting, setSorting] = useState(false);

  useEffect(() => {
    resetArray();
  }, []);

  const resetArray = () => {
    const newArray = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100) + 5);
    setArray(newArray);
  };

  const bubbleSort = async () => {
    setSorting(true);
    const arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setArray([...arr]);
          await new Promise(resolve => setTimeout(resolve, 10)); // Velocidad de animación
        }
      }
    }
    setSorting(false);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-end justify-center gap-1 h-96 w-full bg-white/5 rounded-xl p-4 border border-white/10">
        {array.map((value, idx) => (
          <div
            key={idx}
            className="bg-magenta-500 w-full rounded-t-sm transition-all duration-75"
            style={{ 
              height: `${value}%`,
              backgroundColor: sorting ? '#d946ef' : '#4ade80' // Magenta mientras ordena, verde al terminar
            }}
          ></div>
        ))}
      </div>
      
      <div className="flex gap-4">
        <button onClick={resetArray} disabled={sorting} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-50">
          Generar Nuevo Array
        </button>
        <button onClick={bubbleSort} disabled={sorting} className="px-4 py-2 bg-magenta-600 hover:bg-magenta-700 rounded text-white font-bold disabled:opacity-50">
          Bubble Sort
        </button>
      </div>
    </div>
  );
}
