import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

interface CsBreadcrumbProps {
  info: {
    title: string;
    href: string;
  }[];
}

export const CsBreadcrumb = ({ info = [] }: CsBreadcrumbProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {info?.map((item, index) => {
          if (index === info.length - 1) {
            return (
              <BreadcrumbItem key={item.title}>
                <BreadcrumbPage className="text-black uppercase font-bold">
                  {item.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            );
          }
          return (
            <>
              <BreadcrumbItem key={item.title}>
                <BreadcrumbLink
                  href={item.href}
                  className="text-black uppercase!"
                >
                  {item.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator key={item.title} />
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
