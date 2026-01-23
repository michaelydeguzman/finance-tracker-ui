"use server";

import { revalidatePath } from "next/cache";

// Example server action for categories
export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as "income" | "expense";
  const description = formData.get("description") as string;

  try {
    // Simulate API call - replace with your actual API
    const response = await fetch(`${process.env.API_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, type, description }),
    });

    if (!response.ok) {
      throw new Error("Failed to create category");
    }

    const category = await response.json();

    // Revalidate the categories page
    revalidatePath("/categories");

    return { success: true, data: category };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  try {
    // Simulate API call - replace with your actual API
    const response = await fetch(`${process.env.API_URL}/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      throw new Error("Failed to update category");
    }

    const category = await response.json();

    revalidatePath("/categories");

    return { success: true, data: category };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Simulate API call - replace with your actual API
    const response = await fetch(`${process.env.API_URL}/categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete category");
    }

    revalidatePath("/categories");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
