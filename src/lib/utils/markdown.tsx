import React from 'react';

export function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    const boldPattern = /\*\*(.+?)\*\*/g;
    let match;

    while ((match = boldPattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      parts.push(
        <strong key={`${lineIndex}-${match.index}`} className="font-semibold">
          {match[1]}
        </strong>,
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <React.Fragment key={lineIndex}>
        {parts.length > 0 ? parts : line}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
