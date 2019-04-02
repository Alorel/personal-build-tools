import {dirSync, fileSync, setGracefulCleanup} from 'tmp';

setGracefulCleanup();

export const tmp = {
  dirSync,
  fileSync
};
