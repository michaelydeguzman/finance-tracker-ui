"use client";

import { SortButton } from "@/components/buttons/sort-button";
import Card from "@/components/common/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useSortableData } from "@/hooks/useSortableData";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Mock data - replace with actual household data
const MOCK_HOUSEHOLDS = [
  "De Guzman Household",
  "Smith Family",
  "Johnson Residence",
];

interface HouseholdListProps {
  label?: string;
}

export default function HouseholdList({
  label = "Households",
}: HouseholdListProps) {
  const [households, setHouseholds] = useState<string[]>(MOCK_HOUSEHOLDS);
  const [showAddRow, setShowAddRow] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState<string | null>(null);

  const newRef = useRef<HTMLInputElement | null>(null);
  const editRef = useRef<HTMLInputElement | null>(null);

  const { sortedData, sort, toggleSort } = useSortableData(
    households,
    (h) => h
  );

  const handleSaveClick = () => {
    if (editingHousehold) {
      // Handle edit save
      const newValue = editRef.current?.value?.trim();
      if (newValue && newValue !== editingHousehold) {
        setHouseholds((prev) =>
          prev.map((h) => (h === editingHousehold ? newValue : h))
        );
      }
      setEditingHousehold(null);
    } else {
      // Handle new household save
      const newValue = newRef.current?.value?.trim();
      if (newValue) {
        setHouseholds((prev) => [...prev, newValue]);
        setShowAddRow(false);
      }
    }
  };

  const handleEditClick = (household: string) => {
    setEditingHousehold(household);
  };

  const handleDeleteClick = (household: string) => {
    setHouseholds((prev) => prev.filter((h) => h !== household));
  };

  useEffect(() => {
    if (showAddRow && newRef.current) {
      newRef.current.focus();
    }
  }, [showAddRow]);

  useEffect(() => {
    if (editingHousehold && editRef.current) {
      editRef.current.focus();
    }
  }, [editingHousehold]);

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
            {sortedData?.map((household) => {
              const isEditing = editingHousehold === household;

              return (
                <TableRow key={household} className="group">
                  <TableCell>
                    {isEditing ? (
                      <Input
                        ref={editRef}
                        defaultValue={household}
                        className="w-full"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveClick();
                          } else if (e.key === "Escape") {
                            setEditingHousehold(null);
                          }
                        }}
                      />
                    ) : (
                      <div>{household}</div>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {isEditing ? (
                      <div className="w-full flex gap-2 justify-end">
                        <Button onClick={handleSaveClick}>Save</Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingHousehold(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(household)}
                        >
                          <EditIcon />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(household)}
                        >
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
                  <Input
                    ref={newRef}
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveClick();
                      } else if (e.key === "Escape") {
                        setShowAddRow(false);
                      }
                    }}
                  />
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
