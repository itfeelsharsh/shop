import React from 'react';
import { m } from 'framer-motion';

function InfoPageLayout({ category, title, description, children }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-5xl px-0 py-0 sm:px-6 sm:py-12 lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-4xl">
        <article className="w-full overflow-hidden bg-white sm:rounded-3xl">
          <header className="px-1 py-0 sm:border-b sm:border-gray-100 sm:bg-gradient-to-br sm:from-red-50/80 sm:via-white sm:to-white sm:px-10 sm:py-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
              {description}
            </p>
          </header>

          <div className="px-1 py-0 sm:px-10 sm:py-9 [&_a]:font-medium [&_a]:text-[#B71C1C] [&_a]:underline-offset-4 [&_a:hover]:text-red-900 [&_h2]:mb-3 [&_h2]:mt-8 sm:[&_h2]:border-b sm:[&_h2]:border-gray-100 sm:[&_h2]:pb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-gray-950 [&_h2:first-child]:mt-0 [&_li]:pl-1 [&_p]:mb-5 [&_p]:text-sm [&_p]:leading-7 [&_p]:text-gray-600 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:leading-7 [&_ul]:text-gray-600">
            {children}
          </div>
        </article>
      </div>
    </m.div>
  );
}

export default InfoPageLayout;
