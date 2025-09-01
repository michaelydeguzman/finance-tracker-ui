"use client";

import { SortButton } from "@/components/buttons/sortButton";
import Card from "@/components/common/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";
import { useSortableData } from "@/hooks/useSortableData";
import { BanknoteArrowUpIcon, Car, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function IncomeCategories() {
  const newRef = useRef<HTMLInputElement>(null);

  const [showAddRow, setShowAddRow] = useState(false);

  const { incomeCategories, addIncomeCategory } = useIncomeCategories();
  const { sortedData, sort, toggleSort } = useSortableData(
    incomeCategories,
    (c) => c
  );

  const handleSaveClick = () => {
    if (!newRef.current) {
      return;
    }

    var input = newRef.current.value;

    addIncomeCategory(input);
    setShowAddRow(false);
  };

  useEffect(() => {
    if (showAddRow && newRef.current) {
      newRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      newRef.current?.focus();
    }
  }, [newRef.current, showAddRow]);

  return (
    <Card>
      <div className="w-full flex justify-between items-center">
        <div className="font-semibold pl-2 flex flex-col gap-3">
          <BanknoteArrowUpIcon />
          <div className="ml-[-16px]">
            <SortButton
              label="Income Categories"
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
          Add
        </Button>
      </div>
      <div className="h-[calc(100vh-360px)] overflow-auto">
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
      </div>
    </Card>
  );
}
