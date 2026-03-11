import { Children } from 'react';
import type { SentenceProps } from './types';

export const Sentence = ({ children }: SentenceProps) => {
  const filtered = Children.toArray(children);

  return (
    <span>
      {filtered.map((child, i) => (
        <span key={i}>
          {i > 0 && ' '}
          {child}
        </span>
      ))}
    </span>
  );
};
