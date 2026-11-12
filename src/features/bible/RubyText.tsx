import { memo } from 'react';
import { parseRuby, stripRuby } from '@shared/bible';

interface RubyTextProps {
  /** 「｜漢字《かんじ》」形式のふりがな付きテキスト */
  text: string;
  showRuby: boolean;
}

/** 本文をふりがな付き（または無し）で表示する */
export const RubyText = memo(function RubyText({ text, showRuby }: RubyTextProps) {
  if (!showRuby) return stripRuby(text);
  return parseRuby(text).map((part, index) =>
    typeof part === 'string' ? (
      part
    ) : (
      <ruby key={index}>
        {part.base}
        <rt>{part.reading}</rt>
      </ruby>
    ),
  );
});
