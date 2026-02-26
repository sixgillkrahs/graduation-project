"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const mockReviews = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Property Buyer",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    review:
      "Havenly made the entire process so easy and stress-free. From the first search to handing over the keys, the team was always beside me!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Tenant",
    avatar: "https://i.pravatar.cc/150?u=michael",
    review:
      "The virtual 3D tours saved me weeks of visiting locations. I rented a beautiful apartment in the city center entirely remotely through the app.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emma Davis",
    role: "Landlord",
    avatar: "https://i.pravatar.cc/150?u=emma",
    review:
      "Listing my property was simple. The agent matching feature helped me find reliable tenants in less than a week. Highly recommended platform!",
    rating: 5,
  },
];

const HearCustom = () => {
  const t = useTranslations("HearCustom");

  return (
    <section className="container p-4 md:p-20 mx-auto">
      <div className="cs-typography text-2xl md:text-[40px]! font-semibold! mb-12 mx-auto text-center">
        {t("titleNormal")}{" "}
        <span className="italic font-medium">{t("titleItalic")}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockReviews.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white p-8 rounded-2xl cs-outline-gray shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col gap-6 group"
          >
            {/* Stars */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < item.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Review Text */}
            <p className="cs-paragraph-gray text-base leading-relaxed grow italic">
              "{item.review}"
            </p>

            {/* User Info */}
            <div className="flex items-center gap-4 mt-2 pt-6 border-t border-gray-100">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Image
                  src={item.avatar}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="cs-typography font-bold! text-[16px]!">
                  {item.name}
                </span>
                <span className="text-sm cs-paragraph-gray">{item.role}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HearCustom;
