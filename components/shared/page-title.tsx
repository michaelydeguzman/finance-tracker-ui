import * as React from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export default function PageTitle(props: PageTitleProps): React.ReactElement {
  const { title, subtitle } = props;
  return (
    <div className="flex flex-col">
      {subtitle ? (
        <div className="text-muted-foreground">{subtitle}</div>
      ) : null}
      <h1 className="text-3xl font-semibold">{title}</h1>
    </div>
  );
}
