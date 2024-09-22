import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'htmlToPlaintext', standalone:true })
export class HtmlToPlaintextPipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.replace(/]+>/gm, '') : '';
  }
}
