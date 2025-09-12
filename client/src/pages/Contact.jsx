// Contact.jsx
import React from "react";

export default function Contact() {
  return (
    <>

      <style>{`
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* Hero / Banner */}
      <section
        aria-label="Contact hero"
        className="mt-10 flex flex-col items-center justify-center mx-auto max-md:mx-2 max-md:px-2 max-w-5xl w-full text-center rounded-2xl py-20 md:py-24 bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/banners/image-1.png')] bg-cover bg-center bg-no-repeat"
      >
        <h1 className="text-2xl md:text-3xl font-medium text-white max-w-2xl">
          Empower Your Sales & Marketing with a Next-Gen AI Workforce
        </h1>
        <div className="h-[3px] w-32 my-1 bg-gradient-to-l from-transparent to-primary-dull"></div>
        <p className="text-sm md:text-base text-white/90 max-w-xl">
          Leverage AI Agents for real-time calling and unified multi-channel engagement, optimizing customer interactions at scale.
        </p>
        <a
          href="#contact-details"
          className="px-8 py-2.5 mt-4 text-sm bg-gradient-to-r from-primary-dull to-violet-500 hover:scale-105 transition duration-300 text-white rounded-full inline-block"
        >
          Get Started
        </a>
      </section>

      {/* Contact Details */}
      <section
        id="contact-details"
        className="max-w-5xl w-full mx-auto p-10 text-gray-800"
        aria-label="Contact details"
      >
        <span className="px-2 py-1 text-xs border border-gray-300 rounded-full">
          Reach Out To Us
        </span>

        <h2 className="text-4xl font-bold text-left mt-4">
          We’d love to hear from you.
        </h2>

        <p className="text-left mt-4">
          Or reach out directly at{" "}
          <a
            href="mailto:contact@prebuiltui.com"
            className="text-primary-dull hover:underline"
          >
            contact@prebuiltui.com
          </a>
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {/* Email */}
          <div className="text-left">
            <svg
              className="text-primary bg-primary/20 p-2.5 aspect-square rounded-full size-10"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 4.125H3A1.125 1.125 0 0 0 1.875 5.25V18a1.875 1.875 0 0 0 1.875 1.875h16.5A1.875 1.875 0 0 0 22.125 18V5.25A1.125 1.125 0 0 0 21 4.125m-2.892 2.25L12 11.974 5.892 6.375zM4.125 17.625V7.808l7.115 6.522a1.125 1.125 0 0 0 1.52 0l7.115-6.522v9.817z"
                fill="currentColor"
              />
            </svg>
            <p className="text-lg font-bold mt-2">Email Support</p>
            <p className="text-gray-500 mt-1 mb-4">Our team responds quickly.</p>
            <a
              href="mailto:contact@prebuiltui.com"
              className="text-primary-dull font-semibold break-all"
            >
              contact@prebuiltui.com
            </a>
          </div>

          {/* Office */}
          <div className="text-left">
            <svg
              className="text-primary bg-primary/20 p-2.5 aspect-square rounded-full size-10"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.875 19.125H21.75V9.309a1.125 1.125 0 0 0-.375-2.184h-3.75V4.809a1.125 1.125 0 0 0-.375-2.184H3.75a1.125 1.125 0 0 0-.375 2.184v14.316H2.25a1.125 1.125 0 1 0 0 2.25h20.625a1.125 1.125 0 1 0 0-2.25M19.5 9.375v9.75h-1.875v-9.75zm-13.875-4.5h9.75v14.25h-1.5V15a1.125 1.125 0 0 0-1.125-1.125h-4.5A1.125 1.125 0 0 0 7.125 15v4.125h-1.5zm6 14.25h-2.25v-3h2.25zM6.75 7.5a1.125 1.125 0 0 1 1.125-1.125h.75a1.125 1.125 0 0 1 0 2.25h-.75A1.125 1.125 0 0 1 6.75 7.5m4.5 0a1.125 1.125 0 0 1 1.125-1.125h.75a1.125 1.125 0 1 1 0 2.25h-.75A1.125 1.125 0 0 1 11.25 7.5m-4.5 3.75a1.125 1.125 0 0 1 1.125-1.125h.75a1.125 1.125 0 1 1 0 2.25h-.75A1.125 1.125 0 0 1 6.75 11.25m4.5 0a1.125 1.125 0 0 1 1.125-1.125h.75a1.125 1.125 0 1 1 0 2.25h-.75a1.125 1.125 0 0 1-1.125-1.125"
                fill="currentColor"
              />
            </svg>
            <p className="text-lg font-bold mt-2">Visit Our Office</p>
            <p className="text-gray-500 mt-1 mb-4">Come say hello.</p>
            <address className="not-italic text-primary-dull font-semibold">
              221B Elementary Avenue, NY
            </address>
          </div>

          {/* Call */}
          <div className="text-left">
            <svg
              className="text-primary bg-primary/20 p-2.5 aspect-square rounded-full size-10"
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="none"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m19 13.513-4.415-1.98-.017-.007a1.87 1.87 0 0 0-1.886.243l-2.091 1.781c-1.22-.66-2.478-1.91-3.14-3.113l1.787-2.125q.043-.051.08-.108a1.88 1.88 0 0 0 .148-1.782L7.488 2A1.88 1.88 0 0 0 5.539.89 5.65 5.65 0 0 0 .625 6.5c0 7.651 6.224 13.875 13.875 13.875a5.65 5.65 0 0 0 5.61-4.914A1.88 1.88 0 0 0 19 13.513m-4.5 4.612A11.64 11.64 0 0 1 2.875 6.5a3.4 3.4 0 0 1 2.67-3.332l1.764 3.938-1.796 2.14q-.044.051-.08.108a1.88 1.88 0 0 0-.12 1.841c.883 1.808 2.702 3.615 4.529 4.5a1.88 1.88 0 0 0 1.845-.136q.055-.036.105-.08l2.102-1.787 3.938 1.763a3.4 3.4 0 0 1-3.332 2.67"
                fill="currentColor"
              />
            </svg>
            <p className="text-lg font-bold mt-2">Call Us Directly</p>
            <p className="text-gray-500 mt-1 mb-4">Mon–Fri, 9am–6pm.</p>
            <a href="tel:+12344567789" className="text-primary-dull font-semibold">
              (+1) 234-4567-789
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
