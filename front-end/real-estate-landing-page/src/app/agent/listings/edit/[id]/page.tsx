import EditListing from "@/components/features/my-listings/edit-listing";

interface PageProps {
  params: {
    id: string;
  };
}

const Page = ({ params }: PageProps) => {
  return <EditListing propertyId={params.id} />;
};

export default Page;
