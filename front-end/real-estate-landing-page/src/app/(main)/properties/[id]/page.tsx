import PropertyDetail from "@/components/features/properties/detail";
import {
  buildPropertyBreadcrumbSchema,
  buildPropertyListingSchema,
  buildPropertyMetadata,
  getPublicPropertyDetail,
} from "@/lib/seo";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPublicPropertyDetail(id);

  if (!property) {
    return {
      title: "Property not found",
      description:
        "This property listing is no longer available or could not be loaded.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return buildPropertyMetadata(property, id);
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  const property = await getPublicPropertyDetail(id);
  const schemas = property
    ? [
        buildPropertyBreadcrumbSchema(property, id),
        buildPropertyListingSchema(property, id),
      ]
    : [];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`property-schema-${index + 1}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
      <PropertyDetail />
    </>
  );
};

export default Page;
