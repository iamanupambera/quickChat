import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && typeof value === 'object') {
      this.recursivelyTrimStrings(value);
    }
    return value;
  }

  private recursivelyTrimStrings(obj: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object') {
        this.recursivelyTrimStrings(obj[key]);
      }
    }
  }
}
