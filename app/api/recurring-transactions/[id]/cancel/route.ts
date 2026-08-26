import { runRecurringTransition } from "../../common/transition";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return runRecurringTransition(request, context, "cancel");
}
