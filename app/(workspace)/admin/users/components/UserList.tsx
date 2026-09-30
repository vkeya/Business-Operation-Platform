"use client";

import { useMemo, useState } from "react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  emailVerifiedAt: Date | string | null;
  createdAt: Date | string;

  businesses: Array<{
    id: string;
    name: string;
    isActive: boolean;
    isOwner: boolean;
    roles: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

interface UserListProps {
  users: AdminUser[];
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(date));
}

function statusClass(isActive: boolean) {
  return isActive
    ? "text-emerald-600"
    : "text-muted-foreground";
}

export default function UserList({
  users,
}: UserListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.businesses.some((business) =>
          business.name
            .toLowerCase()
            .includes(query),
        );

      const matchesStatus =
        status === "ALL" ||
        (status === "ACTIVE" &&
          user.isActive) ||
        (status === "INACTIVE" &&
          !user.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [users, search, status]);

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">
                Users
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Platform users and their business access.
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredUsers.length.toLocaleString()}{" "}
              {filteredUsers.length === 1
                ? "user"
                : "users"}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search users or businesses..."
              className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | "ALL"
                    | "ACTIVE"
                    | "INACTIVE",
                )
              }
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">
                All statuses
              </option>
              <option value="ACTIVE">
                Active
              </option>
              <option value="INACTIVE">
                Inactive
              </option>
            </select>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No users found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  User
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Status
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Verification
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Businesses
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {user.name}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </td>

                  <td
                    className={`px-4 py-3 ${statusClass(
                      user.isActive,
                    )}`}
                  >
                    {user.isActive
                      ? "Active"
                      : "Inactive"}
                  </td>

                  <td className="px-4 py-3">
                    {user.emailVerifiedAt
                      ? "Verified"
                      : "Unverified"}
                  </td>

                  <td className="px-4 py-3">
                    {user.businesses.length === 0 ? (
                      <span className="text-muted-foreground">
                        None
                      </span>
                    ) : (
                      <div className="space-y-1">
                        {user.businesses
                          .slice(0, 2)
                          .map((business) => (
                            <div
                              key={business.id}
                              className="text-xs"
                            >
                              {business.name}

                              {business.isOwner && (
                                <span className="ml-1 text-muted-foreground">
                                  · Owner
                                </span>
                              )}
                            </div>
                          ))}

                        {user.businesses.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +
                            {user.businesses.length -
                              2}{" "}
                            more
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}