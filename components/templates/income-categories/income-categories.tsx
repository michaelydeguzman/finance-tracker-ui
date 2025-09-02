"use client";

import { SortButton } from "@/components/buttons/sortButton";
import Card from "@/components/common/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";
import { useSortableData } from "@/hooks/useSortableData";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function IncomeCategories() {
  const newRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const [showAddRow, setShowAddRow] = useState(false);

  const { incomeCategories, addIncomeCategory } = useIncomeCategories();
  const { sortedData, sort, toggleSort } = useSortableData(
    incomeCategories,
    (c) => c
  );

  const [editingCategory, setEditingCategory] = useState<string | null>(null);

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

  useEffect(() => {
    if (editingCategory && editRef.current) {
      editRef.current.focus();
    }
  }, [editingCategory]);

  return (
    <Card>
      <div className="w-full flex justify-between items-center">
        <div className="font-semibold pl-2 flex flex-col gap-3">
          {/* <BanknoteArrowUpIcon /> */}
          <div className="ml-[-16px]">
            <SortButton
              label="Income Categories"
              sort={sort}
              onToggle={toggleSort}
              className="text-md"
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
            {sortedData?.map((category) => {
              const isEditing = editingCategory === category;

              return (
                <TableRow key={category} className="group">
                  <TableCell>
                    {isEditing ? (
                      <Input
                        ref={editRef}
                        defaultValue={category}
                        className="w-full"
                      />
                    ) : (
                      <div>{category}</div>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" variant="ghost">
                        <EditIcon />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <TrashIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
