import { Suspense } from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';
import './style.css';
import AdminNav from './admin-nav';
export const metadata: Metadata = {title:'SANTIS · Projektwochen', robots:{index:false,follow:false}, referrer:'no-referrer'};
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <html lang="de-CH"><body><header><Image src="/santis.png" alt="SANTIS Training AG" width={168} height={56} unoptimized/><Suspense fallback={null}><AdminNav/></Suspense></header><main>{children}</main></body></html>;
}
