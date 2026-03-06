import React from "react";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "../animate-ui/components/radix/tabs";
import { Card } from "../ui/card";

export interface CsTabsProps {
  item: {
    value: string;
    label: string;
    content: React.ReactNode;
  }[];
  defaultValue?: string;
}

const CsTabs = ({ item, defaultValue }: CsTabsProps) => {
  return (
    <Tabs defaultValue={defaultValue || item[0].value}>
      <TabsList className="w-full h-12">
        {item.map((item) => {
          return (
            <TabsTrigger key={item.value} value={item.value} className="h-full">
              {item.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      <Card className="shadow-none py-4 border-none">
        <TabsContents>
          {item.map((item) => {
            return (
              <TabsContent key={item.value} value={item.value}>
                {item.content}
              </TabsContent>
            );
          })}
        </TabsContents>
      </Card>
    </Tabs>
  );
};

export default CsTabs;
