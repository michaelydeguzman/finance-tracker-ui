import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}
export default function Card(props: CardProps) {
  const { children } = props;
  return (
    <div className="bg-card flex w-full flex-col shadow-sm p-4 rounded-2xl gap-3">
      {children}
    </div>
  );
}
