"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";

import { BanknoteArrowDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ExpenseCategories() {
  const { expenseCategories, addExpenseCategory } = useExpenseCategories();

  const [showAddRow, setShowAddRow] = useState(false);
  const newRef = useRef<HTMLInputElement>(null);

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
    <div className="flex w-full flex-col border-2 border-gray-100 p-3 rounded-sm gap-4">
      <div className="w-full flex justify-between items-center">
        <div className="font-semibold pl-2 flex gap-3">
          <BanknoteArrowDownIcon /> Expense Categories
        </div>
        <Button
          onClick={() => {
            setShowAddRow(true);
          }}
          hidden={showAddRow}
        >
          Add
        </Button>
      </div>

      <Table>
        <TableBody>
          {expenseCategories?.map((category) => (
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
                    variant="destructive"
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
    </div>
  );
}
