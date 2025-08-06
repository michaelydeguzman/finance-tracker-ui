interface PageTitleProps {
  title: string;
  subtitle?: string;
}
export default function PageTitle(props: PageTitleProps): React.ReactNode {
  const { title, subtitle } = props;
  return (
    <div className="flex flex-col">
      <div className="text-gray-500">{subtitle}</div>
      <h1 className="text-3xl font-semibold">{title}</h1>
    </div>
  );
}
