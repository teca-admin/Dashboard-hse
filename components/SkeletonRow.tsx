
import React from 'react';

export const SkeletonRow: React.FC = () => {
  const widths = ["10%", "15%", "15%", "30%", "10%", "10%", "10%"];
  
  return (
    <tr className="border-b border-slate-100">
      {widths.map((width, i) => (
        <td key={i} className="px-6 py-4" style={{ width }}>
          <div className="h-2.5 bg-slate-100 w-full rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  );
};
