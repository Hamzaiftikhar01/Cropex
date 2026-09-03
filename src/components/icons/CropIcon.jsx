import { createElement, forwardRef } from 'react';
import { Sprout } from 'lucide-react';
import cropIconNodes from './cropIconNodes';

const CropIcon = forwardRef(function CropIcon(
  { crop, size = 24, color = 'currentColor', strokeWidth = 2, className = '', title, ...rest },
  ref
) {
  const nodes = cropIconNodes[String(crop ?? '').toLowerCase()];
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': 'true' };

  if (!nodes) {
    return (
      <Sprout
        ref={ref}
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        className={className}
        {...a11y}
        {...rest}
      />
    );
  }

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide ${className}`.trim()}
      {...a11y}
      {...rest}
    >
      {nodes.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
});

export default CropIcon;
