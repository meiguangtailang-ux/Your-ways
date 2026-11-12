import { Sheet, SheetBody } from '@/components/Sheet';
import { DisplaySettings } from './DisplaySettings';

/** 読んでいる途中で、文字の大きさなどをすぐ変えるためのシート */
export function DisplaySheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="表示" onClose={onClose}>
      <SheetBody>
        <DisplaySettings />
      </SheetBody>
    </Sheet>
  );
}
