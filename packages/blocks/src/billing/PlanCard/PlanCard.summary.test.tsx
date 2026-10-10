import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@gntik-ai/ui";
import { expectNoAxeViolations } from "../../test/a11y";
import { PlanCard, type PlanSummaryProps } from "./PlanCard";

const minimal = { name: "Fixture Plan", statusLabel: "Activo" };
const full = {
  ...minimal,
  priceMonthly: 10,
  priceAnnual: 100,
  currency: "EUR",
  cycle: "monthly" as const,
  renewsOn: "2027-01-01",
  features: ["Feature A", "Feature B"],
};
const fixtures: Array<[string, Omit<PlanSummaryProps, "variant">]> = [
  [
    "FULL",
    {
      plan: full,
      actions: (
        <>
          <Button>Upgrade</Button>
          <Button>Manage</Button>
        </>
      ),
    },
  ],
  ["MINIMAL", { plan: minimal }],
  ["UNASSIGNED", { emptyLabel: "Sin plan asignado" }],
  ["UNASSIGNED-NO-LABEL", {}],
  ["PRICE-ONLY", { plan: { ...minimal, priceMonthly: 10, currency: "EUR" } }],
  ["ZERO-PRICE", { plan: { ...minimal, priceMonthly: 0, currency: "EUR" } }],
  ["RENEWAL-ONLY", { plan: { ...minimal, renewsOn: "2027-01-01" } }],
  ["FEATURES-ONLY", { plan: { ...minimal, features: ["Feature A"] } }],
  ["ACTIONS-ONLY", { plan: minimal, actions: <Button>Manage</Button> }],
];

describe("PlanCard summary", () => {
  it("renders all FULL values and focusable consumer actions", async () => {
    const user = userEvent.setup();
    render(<PlanCard variant="summary" {...fixtures[0]![1]} />);
    expect(
      screen.getByRole("heading", { name: "Fixture Plan" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("€10")).toBeInTheDocument();
    expect(screen.getByText("Billed monthly")).toBeInTheDocument();
    expect(screen.getByText("Renews January 1, 2027")).toBeInTheDocument();
    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual(["Feature A", "Feature B"]);
    await user.click(screen.getByRole("button", { name: "Annual" }));
    expect(screen.getByText("€100")).toBeInTheDocument();
    expect(screen.getByText("Billed annually")).toBeInTheDocument();
    for (const name of ["Upgrade", "Manage"]) {
      const button = screen.getByRole("button", { name });
      expect(button.tagName).toBe("BUTTON");
      button.focus();
      expect(button).toHaveFocus();
    }
  });

  it.each(["dark", "light", "high_contrast"])(
    "has no axe violations for every fixture in %s",
    async (theme) => {
      document.documentElement.className = theme;
      for (const [, props] of fixtures) {
        const { container, unmount } = render(
          <PlanCard variant="summary" {...props} />,
        );
        await expectNoAxeViolations(container);
        unmount();
      }
    },
  );
  it("renders ACTIONS-ONLY as a focusable native button with Enter and Space activation", async () => {
    const user = userEvent.setup();
    const onManage = vi.fn();
    render(
      <PlanCard
        variant="summary"
        plan={minimal}
        actions={<Button onClick={onManage}>Manage</Button>}
      />,
    );
    const manage = screen.getByRole("button", { name: "Manage" });
    expect(manage.tagName).toBe("BUTTON");
    expect(screen.queryByText(/€|\$|Billed|Renews/)).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
    await user.tab();
    expect(manage).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onManage).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(onManage).toHaveBeenCalledTimes(2);
  });
  it("renders FEATURES-ONLY as an accessible list without billing or actions", () => {
    render(
      <PlanCard
        variant="summary"
        plan={{ ...minimal, features: ["Feature A"] }}
      />,
    );
    expect(
      screen.getByRole("list", { name: "Plan features" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("Feature A");
    expect(screen.queryByText(/€|\$|Billed|Renews/)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("renders RENEWAL-ONLY without any other optional region", () => {
    render(
      <PlanCard
        variant="summary"
        plan={{ ...minimal, renewsOn: "2027-01-01" }}
      />,
    );
    expect(screen.getByText("Renews January 1, 2027")).toBeInTheDocument();
    expect(screen.queryByText(/€|\$|Billed/)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });
  it.each([
    ["PRICE-ONLY", 10, "€10"],
    ["ZERO-PRICE", 0, "€0"],
  ] as const)(
    "renders %s without cycle text or a focusable toggle",
    async (_fixture, priceMonthly, amount) => {
      const user = userEvent.setup();
      const { container } = render(
        <PlanCard
          variant="summary"
          plan={{ ...minimal, priceMonthly, currency: "EUR" }}
        />,
      );
      expect(screen.getByText(amount)).toBeInTheDocument();
      expect(screen.queryByRole("group")).toBeNull();
      expect(screen.queryByRole("button")).toBeNull();
      expect(screen.queryByText(/Billed|Renews|month|annual/i)).toBeNull();
      expect(screen.queryByRole("list")).toBeNull();
      await user.tab();
      expect(document.body).toHaveFocus();
      await expectNoAxeViolations(container);
    },
  );

  it("shows supplied monthly and annual totals verbatim with an accessible toggle", async () => {
    const user = userEvent.setup();
    const onCycleChange = vi.fn();
    render(
      <PlanCard
        variant="summary"
        plan={{
          ...minimal,
          priceMonthly: 10,
          priceAnnual: 100,
          currency: "EUR",
        }}
        onCycleChange={onCycleChange}
      />,
    );
    expect(screen.getByText("€10")).toBeInTheDocument();
    const monthly = screen.getByRole("button", {
      name: "Monthly",
    });
    const annual = screen.getByRole("button", { name: "Annual" });
    expect(monthly).toHaveAttribute("aria-pressed", "true");
    await user.tab();
    expect(monthly).toHaveFocus();
    await user.click(annual);
    expect(screen.getByText("€100")).toBeInTheDocument();
    expect(screen.queryByText("€1,200")).toBeNull();
    expect(annual).toHaveAttribute("aria-pressed", "true");
    expect(onCycleChange).toHaveBeenCalledWith("annual");
    await user.click(monthly);
    expect(screen.getByText("€10")).toBeInTheDocument();
  });

  it("renders an annual-only price without a toggle", () => {
    render(
      <PlanCard
        variant="summary"
        plan={{ ...minimal, priceAnnual: 100, currency: "EUR" }}
      />,
    );
    expect(screen.getByText("€100")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText(/Billed/)).toBeNull();
  });

  it("renders supplied cycle text independently of price", () => {
    render(
      <PlanCard variant="summary" plan={{ ...minimal, cycle: "annual" }} />,
    );
    expect(screen.getByText("Billed annually")).toBeInTheDocument();
    expect(screen.queryByText(/€|\$/)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("renders only the consumer name and status for MINIMAL", () => {
    const { container } = render(<PlanCard variant="summary" plan={minimal} />);
    expect(
      screen.getByRole("heading", { name: "Fixture Plan" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
    expect(container.textContent).toBe("Fixture PlanActivo");
    expect(screen.queryByText(/Scale|\$|Billed|Renews|Active/)).toBeNull();
  });

  it("renders UNASSIGNED using only the consumer empty label", () => {
    const { container } = render(
      <PlanCard variant="summary" emptyLabel="Sin plan asignado" />,
    );
    expect(
      screen.getByRole("heading", { name: "Sin plan asignado" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.textContent).toBe("Sin plan asignado");
  });

  it("renders no heading for UNASSIGNED-NO-LABEL and warns only in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      vi.stubEnv("NODE_ENV", "development");
      const { container, unmount } = render(<PlanCard variant="summary" />);
      expect(screen.queryByRole("heading")).toBeNull();
      expect(container.textContent).toBe("");
      expect(warn).toHaveBeenCalledWith(
        "PlanCard summary: supply a plan name or emptyLabel.",
      );
      unmount();
      warn.mockClear();
      vi.stubEnv("NODE_ENV", "production");
      render(<PlanCard variant="summary" />);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllEnvs();
      warn.mockRestore();
    }
  });
});
