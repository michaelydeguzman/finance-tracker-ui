"use client";

import { SortButton } from "@/components/buttons/sortButton";
import Card from "@/components/common/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useSortableData } from "@/hooks/useSortableData";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CategoryListProps {
  label: string;
  data: string[];
  onAdd: (category: string) => void;
  //   categoryType: "expense" | "income";
}

export default function CategoryList(props: CategoryListProps) {
  const { data, onAdd, label } = props;

  const newRef = useRef<HTMLInputElement | null>(null);
  const editRef = useRef<HTMLInputElement | null>(null);

  const [showAddRow, setShowAddRow] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const { sortedData, sort, toggleSort } = useSortableData(data, (c) => c);

  const handleSaveClick = () => {
    if (!newRef.current) return;

    const input = newRef.current.value;
    onAdd(input);
    setShowAddRow(false);
  };

  const handleEditClick = (category: string) => {
    setEditingCategory(category);
  };

  useEffect(() => {
    if (showAddRow && newRef.current) {
      newRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      newRef.current?.focus();
    }
  }, [showAddRow]);

  useEffect(() => {
    if (editingCategory && editRef.current) {
      editRef.current.focus();
    }
  }, [editingCategory]);

  return (
    <Card>
      <div className="w-full flex justify-between items-center">
        <div className="font-semibold pl-2 flex flex-col gap-3">
          <div className="ml-[-16px]">
            <SortButton
              label={label}
              sort={sort}
              onToggle={toggleSort}
              className="text-md"
            />
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => setShowAddRow(true)}
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
                    {isEditing ? (
                      <div className="w-full flex gap-2 justify-end">
                        <Button onClick={handleSaveClick}>Save</Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingCategory(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(category)}
                        >
                          <EditIcon />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <TrashIcon />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {showAddRow && (
              <TableRow className="w-full">
                <TableCell>
                  <Input ref={newRef} className="w-full" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="w-full flex gap-2 justify-end">
                    <Button onClick={handleSaveClick}>Save</Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddRow(false)}
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
