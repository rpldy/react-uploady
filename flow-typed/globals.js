// minimal replacement for the removed flow-typed node libdef - only process.env is used
declare var process: { env: { [key: string]: string | void } };
