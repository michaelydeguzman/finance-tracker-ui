import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardItem {
  id: number;
  component: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export default function Dashboard(): React.ReactNode {
  const dashboardItems: DashboardItem[] = [
    {
      id: 1,
      component: <></>,
      title: "Expenses this Week",
      description: "Summary of expenses for current week",
    },
    {
      id: 2,
      component: <></>,
      title: "Expenses this Month",
      description: "Summary of expenses for current month",
    },
    {
      id: 3,
      component: <></>,
      title: "Expenses YTD",
      description: "Summary of expenses for current year",
    },
  ];

  return (
    <>
      <div className="flex gap-4">
        {dashboardItems.map((item) => (
          <Card key={item.id} className="w-full flex">
            <CardHeader>
              <div className="flex flex-col gap-2">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription> {item.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div>{item.component}</div>
            </CardContent>
            <CardFooter>
              <Button>See More</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
