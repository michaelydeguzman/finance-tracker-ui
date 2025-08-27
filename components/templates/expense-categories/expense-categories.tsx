"use client";

import { SortButton } from "@/components/buttons/sortButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { useSortableData } from "@/hooks/useSortableData";

import { BanknoteArrowDownIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ExpenseCategories() {
  const newRef = useRef<HTMLInputElement>(null);
  const [showAddRow, setShowAddRow] = useState(false);

  const { expenseCategories, addExpenseCategory } = useExpenseCategories();

  const { sortedData, sort, toggleSort } = useSortableData(
    expenseCategories,
    (c) => c
  );

  const handleSaveClick = () => {
    if (!newRef.current) {
      return;
    }

    var input = newRef.current.value;

    addExpenseCategory(input);
    setShowAddRow(false);
  };

  useEffect(() => {
    if (showAddRow && newRef.current) {
      newRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      newRef.current?.focus();
    }
  }, [newRef.current, showAddRow]);

  return (
    <div className="flex w-full flex-col border-2 border-gray-100 p-6 rounded-4xl gap-4">
      <div className="w-full flex justify-between items-center">
        <div className="font-semibold pl-2 flex flex-col gap-3">
          <BanknoteArrowDownIcon />
          <div className="ml-[-16px]">
            <SortButton
              label="Expense Categories"
              sort={sort}
              onToggle={toggleSort}
            />
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            setShowAddRow(true);
          }}
          hidden={showAddRow}
        >
          <PlusIcon />
          Add Category
        </Button>
      </div>
      <div className="h-[calc(100vh-330px)] overflow-auto">
        <Table>
          <TableBody>
            {sortedData?.map((category) => (
              <TableRow key={category}>
                <TableCell>{category}</TableCell>
              </TableRow>
            ))}
            {showAddRow && (
              <TableRow>
                <TableCell>
                  <div className="w-full flex gap-2">
                    <Input ref={newRef} />
                    <Button onClick={handleSaveClick}>Save</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddRow(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>{" "}
    </div>
  );
}
