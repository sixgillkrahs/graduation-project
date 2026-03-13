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
  value?: string;
  onValueChange?: (value: string) => void;
}

const CsTabs = ({ item, defaultValue, value, onValueChange }: CsTabsProps) => {
  return (
    <Tabs
      defaultValue={defaultValue || item[0].value}
      value={value}
      onValueChange={onValueChange}
    >
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
        <TabsContents className="px-1">
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
