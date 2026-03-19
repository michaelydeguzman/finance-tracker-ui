"use client";

import { SortButton } from "@/components/shared/sort-button";
import Card from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useSortableData } from "@/hooks/useSortableData";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Category } from "@/app/categories/types/category.model";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface CategoryListProps {
  label: string;
  data: Category[];
  onAdd: (category: string) => void;
  onUpdate?: (id: Category["id"], category: string) => void;
  onDelete?: (id: Category["id"]) => void;
  pending?: boolean;
}

export default function CategoryList(props: CategoryListProps) {
  const { data, onAdd, onUpdate, onDelete, label, pending = false } = props;

  const newRef = useRef<HTMLInputElement | null>(null);
  const editRef = useRef<HTMLInputElement | null>(null);

  const [showAddRow, setShowAddRow] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const { sortedData, sort, toggleSort } = useSortableData(data, (c) => c.name);

  const canEdit = Boolean(onUpdate);
  const canDelete = Boolean(onDelete);
  const showActions = canEdit || canDelete;

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

  const handleSaveClick = () => {
    if (!newRef.current || pending) return;

    const input = newRef.current.value.trim();

    if (!input) {
      newRef.current.focus();
      return;
    }

    onAdd(input);
    newRef.current.value = "";
    setShowAddRow(false);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category.id);
    setEditValue(category.name);
  };

  const handleUpdateClick = () => {
    if (!editingCategory || !onUpdate || pending) return;

    const trimmed = editValue.trim();

    if (!trimmed) {
      editRef.current?.focus();
      return;
    }

    onUpdate(editingCategory, trimmed);
    setEditingCategory(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue("");
  };

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
          disabled={pending}
        >
          <PlusIcon />
          Add
        </Button>
      </div>

      <div className="h-[calc(100vh-360px)] overflow-auto">
        {pending ? (
          <Spinner />
        ) : (
          <Table aria-busy={pending}>
            <TableBody>
              {sortedData?.map((category) => {
                const isEditing = editingCategory === category.id;

                return (
                  <TableRow key={category.id} className="group">
                    <TableCell className="pl-2">
                      {isEditing ? (
                        <Input
                          ref={editRef}
                          value={editValue}
                          onChange={(event) => setEditValue(event.target.value)}
                          disabled={pending}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleUpdateClick();
                            }

                            if (event.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                        />
                      ) : (
                        category.name
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="w-full flex gap-2 justify-end">
                          <Button
                            onClick={handleUpdateClick}
                            disabled={pending}
                          >
                            {pending ? "Saving" : "Save"}
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        showActions && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {canEdit && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditClick(category)}
                                disabled={pending}
                                aria-label={`Edit ${category.name}`}
                              >
                                <EditIcon />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDelete?.(category.id)}
                                disabled={pending}
                                aria-label={`Delete ${category.name}`}
                              >
                                <TrashIcon />
                              </Button>
                            )}
                          </div>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {sortedData.length === 0 && !showAddRow && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground pl-2">
                    No categories found. Click add to continue.
                  </TableCell>
                </TableRow>
              )}

              {showAddRow && (
                <TableRow className="w-full">
                  <TableCell>
                    <Input ref={newRef} className="w-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="w-full flex gap-2 justify-end">
                      <Button onClick={handleSaveClick} disabled={pending}>
                        {pending ? "Saving" : "Save"}
                      </Button>
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
        )}
      </div>
    </Card>
  );
}
