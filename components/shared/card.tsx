import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}
export default function Card(props: CardProps) {
  const { children } = props;
  return (
    <div className="flex w-full flex-col shadow-md p-6 rounded-2xl gap-4 border-t-2 border-gray-50">
      {children}
    </div>
  );
}
