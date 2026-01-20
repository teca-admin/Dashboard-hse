
import React from 'react';

export const SkeletonRow: React.FC = () => {
  const widths = ["10%", "10%", "10%", "10%", "10%", "10%", "10%", "10%", "10%", "10%"];
  
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {widths.map((width, i) => (
        <td key={i} className="px-4 py-4" style={{ width }}>
          <div className="h-4 bg-slate-200 rounded w-full mx-auto"></div>
        </td>
      ))}
    </tr>
  );
};
