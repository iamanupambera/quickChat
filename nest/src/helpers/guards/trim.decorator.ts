import { UsePipes } from '@nestjs/common';
import { TrimPipe } from '../pipes/trim.pipe';

export function Trim() {
  return UsePipes(new TrimPipe());
}
