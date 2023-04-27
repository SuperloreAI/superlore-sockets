declare module "archiver" {
  import { Readable } from "stream";

  interface ArchiverOptions {
    zlib?: object;
    forceLocalTime?: boolean;
    forceZip64?: boolean;
    store?: boolean;
    comment?: string;
    allowHalfOpen?: boolean;
  }

  interface EntryData {
    name: string;
    prefix?: string;
    stats?: object;
    mode?: number;
    date?: Date;
    comment?: string;
    type?: string;
  }

  type Archiver = ReturnType<typeof create>;

  function create(format: string, options?: ArchiverOptions): Archiver;

  export default create;
}
