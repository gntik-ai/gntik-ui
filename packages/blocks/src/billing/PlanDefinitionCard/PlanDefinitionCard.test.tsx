import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@gntik-ai/ui";
import { expectNoAxeViolations } from "../../test/a11y";
import { PlanDefinitionCard } from "./PlanDefinitionCard";

const definition = {
  name: "Fixture Plan",
  slug: "fixture-plan",
  description: "A plan definition.",
  status: "active" as const,
  capabilities: { Search: true, Export: false },
  quotas: { Requests: 100, Storage: "20 GB" },
  tenantCount: 4,
  updatedAt: "2027-01-01",
};

describe("PlanDefinitionCard", () => {
  it("keeps consumer buttons and links native, keyboard reachable and actionable", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onView = vi.fn();
    render(
      <PlanDefinitionCard
        plan={definition}
        actions={
          <>
            <Button onClick={onEdit}>Edit</Button>
            <a
              href="#tenants"
              onClick={onView}
              className="text-primary-text underline"
            >
              View tenants
            </a>
          </>
        }
      />,
    );
    const edit = screen.getByRole("button", { name: "Edit" });
    const view = screen.getByRole("link", { name: "View tenants" });
    expect(edit.tagName).toBe("BUTTON");
    expect(view.tagName).toBe("A");
    await user.tab();
    expect(edit).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onEdit).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(onEdit).toHaveBeenCalledTimes(2);
    await user.tab();
    expect(view).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onView).toHaveBeenCalledTimes(1);
  });

  it("omits the optional description and preserves zero quota and tenant values", () => {
    render(
      <PlanDefinitionCard
        plan={{
          ...definition,
          description: undefined,
          tenantCount: 0,
          quotas: { Requests: 0 },
        }}
      />,
    );
    expect(screen.queryByText("A plan definition.")).toBeNull();
    expect(
      screen.getByText("Requests", { selector: "dt" }).nextElementSibling,
    ).toHaveTextContent("0");
    expect(
      screen.getByText("Assigned tenants", { selector: "dt" })
        .nextElementSibling,
    ).toHaveTextContent("0");
  });

  it.each(["dark", "light", "high_contrast"])(
    "has no axe violations in %s at either density",
    async (theme) => {
      document.documentElement.className = theme;
      for (const density of ["compact", "full"] as const) {
        const { container, unmount } = render(
          <PlanDefinitionCard
            plan={definition}
            density={density}
            actions={<Button>Edit</Button>}
          />,
        );
        await expectNoAxeViolations(container);
        unmount();
      }
    },
  );
  it.each([
    ["draft", "Draft"],
    ["active", "Active"],
    ["deprecated", "Deprecated"],
    ["archived", "Archived"],
  ] as const)(
    "shows a visible %s label and allows consumer override",
    (status, label) => {
      const { unmount } = render(
        <PlanDefinitionCard plan={{ ...definition, status }} />,
      );
      expect(screen.getByText(label)).toBeVisible();
      unmount();
      render(
        <PlanDefinitionCard
          plan={{ ...definition, status }}
          statusLabels={{ [status]: "Consumer status" }}
        />,
      );
      expect(screen.getByText("Consumer status")).toBeVisible();
      expect(screen.queryByText(label)).toBeNull();
    },
  );
  it.each(["compact", "full"] as const)(
    "renders the definition in %s density without commercial nodes",
    (density) => {
      const { container } = render(
        <PlanDefinitionCard plan={definition} density={density} />,
      );
      expect(
        screen.getByRole("heading", { name: "Fixture Plan" }),
      ).toBeInTheDocument();
      expect(screen.getByText("fixture-plan")).toBeInTheDocument();
      expect(screen.getByText("A plan definition.")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      const flags = screen.getByRole("list", { name: "Capabilities" });
      expect(
        within(flags)
          .getAllByRole("listitem")
          .map((item) => item.textContent),
      ).toEqual(["SearchEnabled", "ExportDisabled"]);
      expect(
        screen.getByText("Requests", { selector: "dt" }).nextElementSibling,
      ).toHaveTextContent("100");
      expect(
        screen.getByText("Storage", { selector: "dt" }).nextElementSibling,
      ).toHaveTextContent("20 GB");
      expect(
        screen.getByText("Assigned tenants", { selector: "dt" })
          .nextElementSibling,
      ).toHaveTextContent("4");
      expect(
        screen.getByText("Updated", { selector: "dt" }).nextElementSibling,
      ).toHaveTextContent("January 1, 2027");
      expect(screen.queryByRole("group", { name: "Billing cycle" })).toBeNull();
      expect(screen.queryByRole("button")).toBeNull();
      expect(container.textContent).not.toMatch(
        /€|\$|price|Billed|Renews|Upgrade|Monthly|Annual/,
      );
    },
  );
});
