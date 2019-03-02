import * as Bluebird from 'bluebird';
import * as glob$ from 'glob';
import * as _ from 'lodash';

export function globAsync(glob: string | string[], opts: glob$.IOptions = {}): Bluebird<string[]> {
  return Bluebird.resolve<string[]>(_.castArray(glob))
    .map(g => new Bluebird<string[]>((resolve, reject) => {
      glob$(g, opts, (err, matches) => {
        if (err) {
          reject(err);
        } else {
          resolve(matches);
        }
      });
    }))
    .reduce<string[], any>(
      (acc, files) => {
        acc.push(...files);

        return acc;
      },
      []
    );
}
