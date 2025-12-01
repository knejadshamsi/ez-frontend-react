import outputStyles from '../Output.module.less';

interface HighlightedTextProps {
  text: string;
  className?: string;
}

// Text component that automatically highlights numbers in formatted text
// Uses regex pattern matching to identify and style numeric values with bold and underline
export const HighlightedText = ({ text, className }: HighlightedTextProps) => {
  const numberPattern = /-?\d{1,3}(?:,\d{3})*(?:\.\d+)?%?(?:°C)?|\d+(?:\.\d+)?%?(?:°C)?/g;

  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = numberPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    parts.push(
      <span key={match.index} className={outputStyles.highlightedNumber}>
        {match[0]}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
