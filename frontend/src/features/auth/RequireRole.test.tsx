import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./auth-store";
import { RequireRole } from "./RequireRole";

let root: Root | null = null;

async function renderAdminGuard(children: ReactNode = <div>Admin area</div>) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={(
              <RequireRole allowedRoles={["admin"]} unauthenticatedRedirectTo="/admin/login">
                {children}
              </RequireRole>
            )}
          />
          <Route path="/admin/login" element={<div>Admin login</div>} />
        </Routes>
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
}

describe("RequireRole admin redirect", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isInitialized: true });
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    document.body.replaceChildren();
  });

  it("redirects an unauthenticated visitor to the admin login", async () => {
    await renderAdminGuard();

    expect(document.body.textContent).toContain("Admin login");
    expect(document.body.textContent).not.toContain("Không có quyền truy cập");
  });

  it("keeps permission denied for an authenticated non-admin user", async () => {
    useAuthStore.setState({
      user: {
        id: "customer-1",
        role: "customer",
        fullName: "Customer",
        email: "customer@example.com",
        phone: "0900000000",
      },
      isInitialized: true,
    });

    await renderAdminGuard();

    expect(document.body.textContent).toContain("Không có quyền truy cập");
    expect(document.body.textContent).not.toContain("Admin login");
  });
});
