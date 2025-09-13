import React from "react";
import { assets } from "@/assets/assets";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";

export default function Contact() {
  const bannerUrl =
    typeof assets.contact_banner === "string"
      ? assets.contact_banner
      : assets.contact_banner?.src || "";

  // Only the 3 info cards go here
  const contactInfo = [
    {
      id: "email",
      icon: <MdEmail className="text-primary bg-primary/10 p-2.5 rounded-full size-10" />,
      title: "Email Support",
      subtitle: "We respond quickly.",
      details: [
        { text: "contact@vikcart.in", href: "mailto:contact@vikcart.in" },
        { text: "info@vikcart.in", href: "mailto:info@vikcart.in" },
      ],
    },
    {
      id: "office",
      icon: <MdLocationOn className="text-primary bg-primary/10 p-2.5 rounded-full size-10" />,
      title: "Visit Our Office",
      subtitle: "Come say hello.",
      details: [{ text: "No.21, Chennai, Tamil Nadu, India", href: null }],
    },
    {
      id: "call",
      icon: <MdPhone className="text-primary bg-primary/10 p-2.5 rounded-full size-10" />,
      title: "Call Us Directly",
      subtitle: "Mon–Sun, 8am–10pm.",
      details: [{ text: "+91 9876543210", href: "tel:+919876543210" }],
    },
  ];

  return (
    <div className=" gap-3 sm:gap-8">
      {/* Hero Section */}
      <section
        aria-label="Contact hero"
        className="mt-10  sm:mb-20 flex flex-col items-center justify-center mx-auto max-md:mx-2 max-md:px-2 h-100 bg-cover w-full text-center rounded-2xl py-20 md:py-24 bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      >
        <h1 className="text-2xl md:text-5xl font-medium md:font-bold max-w-2xl">
          Fresh Groceries Delivered Right to Your Doorstep
        </h1>
        <div className="h-[3px] w-32 my-1 bg-gradient-to-l from-transparent to-primary-dull"></div>
        <p className="text-sm md:text-base text-slate-600/90 max-w-xl">
          Shop farm-fresh fruits, vegetables, and daily essentials with Vikcart.
          Quick, convenient, and hassle-free grocery shopping anytime.
        </p>
        <a
          href="#contact-details"
          className="px-8 py-2.5 mt-4 text-sm bg-gradient-to-r from-amber-400 to-primary hover:scale-105 transition duration-300 text-slate-600 rounded-full inline-block"
        >
          Get Started
        </a>
      </section>

      {/* Contact Details */}
      <section
        id="contact-details"
        className="w-full mx-auto p-10 text-gray-800"
        aria-label="Contact details"
      >
        <div className="grid md:grid-cols-2 gap-12">
          {/* LEFT: Title + contact cards */}
          <div>
            <span className="px-2 py-1 text-xs border border-gray-300 rounded-full">
              Reach Out To Us
            </span>

            <h2 className="text-4xl font-bold text-left mt-4">
              We’d love to hear from you.
            </h2>

            <p className="text-left mt-4">
              Or reach out directly at{" "}
              <a
                href="mailto:contact@vikcart.in"
                className="text-primary-dull hover:underline"
              >
                contact@vikcart.in
              </a>
            </p>

            {/* Contact Info Cards */}
            <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              {contactInfo.map((item) => (
                <div key={item.id} className="text-left">
                  {item.icon}
                  <p className="text-lg font-bold mt-2">{item.title}</p>
                  <p className="text-gray-500 mt-1 mb-4">{item.subtitle}</p>
                  {item.details.map((detail, i) =>
                    detail.href ? (
                      <a
                        key={i}
                        href={detail.href}
                        className="block text-primary-dull font-semibold break-all"
                      >
                        {detail.text}
                      </a>
                    ) : (
                      <address
                        key={i}
                        className="not-italic text-primary-dull font-semibold"
                      >
                        {detail.text}
                      </address>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Google Map */}
          <div className="flex justify-center items-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.865877683831!2d80.24694054009676!3d12.980429135670375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1757743551061!5m2!1sen!2sin"
              width="90%"
              height="350"
          
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Vikcart Location Map"
              className="rounded-xl border-3 border-primary shadow-md"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
