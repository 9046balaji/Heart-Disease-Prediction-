// Declaration file for modules without type definitions

declare module 'nodemailer' {
  export function createTransport(options: any): any;
}

declare module 'speakeasy' {
  const generateSecret: (options: any) => any;
  const totp: { 
    verify: (options: any) => boolean 
  };
  export { generateSecret, totp };
  export default { generateSecret, totp };
}

declare module 'qrcode' {
  const toDataURL: (secret: string) => Promise<string>;
  export { toDataURL };
  export default { toDataURL };
}