import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectTypeOf } from "vitest";
import { expectNoAxeViolations } from "../test/a11y";
import PendingActivationPage, { type PendingActivationPageProps } from "./Page";

const recoveryLinks = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Review sign-up", href: "/sign-up" },
];
const states = [
  ["default", {}],
  ["loading", { loading: true }],
  ["no-access", { errorState: "no-access" }],
  ["not-found", { errorState: "not-found" }],
  ["error", { errorState: "error" }],
] as const;
const onAction = vi.fn();
const actions = [
  { label: "Review request", href: "/requests/2048?from=pending" },
  { label: "Check status", onClick: onAction },
  { label: "Account details", href: "/account" },
];

describe("PendingActivationPage", () => {
  it("accepts consumer labels for recovery, skip navigation, actions and retry", () => {
    const { rerender } = render(
      <PendingActivationPage
        recoveryLinks={recoveryLinks}
        recoveryLabel="Return to your account"
        skipLinkLabel="Skip to account status"
        actionsLabel="Next steps"
        actions={actions}
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "Return to your account" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Skip to account status" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Next steps" })).toBeVisible();
    rerender(
      <PendingActivationPage
        recoveryLinks={recoveryLinks}
        errorState="error"
        retryLabel="Check again"
        onRetry={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Check again" })).toBeVisible();
  });

  it.each(states)(
    "tabs through the visible controls in %s with focus rings",
    async (_, state) => {
      const user = userEvent.setup();
      render(
        <PendingActivationPage
          {...state}
          recoveryLinks={recoveryLinks}
          actions={actions}
          onRetry={() => {}}
        />,
      );
      // AuthLayout supplies its skip link before the page's own controls.
      await user.tab();
      expect(screen.getByRole("link", { name: /Skip/ })).toHaveFocus();
      const expected =
        "errorState" in state
          ? state.errorState === "error"
            ? ["Retry", "Sign in", "Review sign-up"]
            : ["Sign in", "Review sign-up"]
          : "loading" in state
            ? ["Sign in", "Review sign-up"]
            : [
                "Review request",
                "Check status",
                "Account details",
                "Sign in",
                "Review sign-up",
              ];
      for (const name of expected) {
        await user.tab();
        const control = screen.getByRole(
          name === "Retry" || name === "Check status" ? "button" : "link",
          { name },
        );
        expect(control).toHaveFocus();
        expect(control).toHaveClass("focus-visible:outline-focus-ring");
      }
      await user.tab();
      expect(document.body).toHaveFocus();
    },
  );

  it("preserves reading order and renders labels as text", () => {
    const { container } = render(
      <PendingActivationPage
        recoveryLinks={recoveryLinks}
        title="Heading"
        intro="Intro"
        statusTitle="Status"
        statusMessage="Message"
        reference={{ label: "Reference", value: "REF-1" }}
        actions={[
          {
            label: "<script>throw new Error()</script>",
            href: "/continue?next=%3Cscript%3E",
          },
        ]}
      />,
    );
    const content = screen.getByRole("main").textContent ?? "";
    const offsets = [
      "Heading",
      "Intro",
      "Status",
      "Message",
      "Reference",
      "REF-1",
      "<script>throw new Error()</script>",
      "Sign in",
    ].map((text) => content.indexOf(text));
    expect(offsets.every((offset) => offset >= 0)).toBe(true);
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "<script>throw new Error()</script>" }),
    ).toHaveAttribute("href", "/continue?next=%3Cscript%3E");
  });

  it.each(states)(
    "has no email-verification affordances or network calls in %s",
    (_, state) => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const xhrSpy = vi.spyOn(XMLHttpRequest.prototype, "open");
      try {
        render(
          <PendingActivationPage
            {...state}
            recoveryLinks={recoveryLinks}
            onRetry={() => {}}
          />,
        );
        expect(
          screen.queryByRole("button", {
            name: /resend|change.*email|support|request access/i,
          }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("link", { name: /resend|change.*email|support/i }),
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/\d+:\d{2}/)).not.toBeInTheDocument();
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(xhrSpy).not.toHaveBeenCalled();
      } finally {
        fetchSpy.mockRestore();
        xhrSpy.mockRestore();
      }
    },
  );

  it.each([
    ["default", {}],
    ["loading without actions", { loading: true }],
    ["loading with actions", { loading: true, actions }],
    [
      "with reference",
      { reference: { label: "Request received", value: "REQ-2048" } },
    ],
    ["with actions", { actions }],
    ["no-access", { errorState: "no-access" }],
    ["not-found", { errorState: "not-found" }],
    ["error", { errorState: "error", onRetry: () => {} }],
  ] as const)(
    "has no axe violations in %s across all themes",
    async (_, state) => {
      for (const theme of ["dark", "light", "high_contrast"]) {
        document.documentElement.className = theme;
        const { container, unmount } = render(
          <PendingActivationPage {...state} recoveryLinks={recoveryLinks} />,
        );
        await expectNoAxeViolations(container);
        unmount();
      }
    },
  );

  it.each(states)(
    "keeps both exact recovery destinations in %s",
    (_, state) => {
      render(
        <PendingActivationPage {...state} recoveryLinks={recoveryLinks} />,
      );
      const recovery = screen.getByRole("navigation", {
        name: "Account recovery",
      });
      expect(within(recovery).getAllByRole("link")).toHaveLength(2);
      expect(
        within(recovery).getByRole("link", { name: "Sign in" }),
      ).toHaveAttribute("href", "/sign-in");
      expect(
        within(recovery).getByRole("link", { name: "Review sign-up" }),
      ).toHaveAttribute("href", "/sign-up");
      expectTypeOf<
        Pick<PendingActivationPageProps, "recoveryLinks">
      >().toEqualTypeOf<{
        recoveryLinks: readonly { label: string; href: string }[];
      }>();
    },
  );

  it.each(["no-access", "not-found"] as const)(
    "shows consumer %s copy without action controls",
    (errorState) => {
      const { container } = render(
        <PendingActivationPage
          recoveryLinks={recoveryLinks}
          errorState={errorState}
          errorTitle="Cannot open this account"
          errorMessage="Return to registration to continue."
          actions={actions}
          loading
        />,
      );
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Cannot open this account",
        }),
      ).toBeVisible();
      expect(
        screen.getByText("Return to registration to continue."),
      ).toBeVisible();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("region", { name: "Available actions" }),
      ).not.toBeInTheDocument();
      if (errorState === "no-access")
        expect(container.querySelector("svg.lucide-lock")).toBeInTheDocument();
    },
  );

  it.each(["click", "Enter", "Space"])(
    "retries once using %s without demo controls or details",
    async (gesture) => {
      const onRetry = vi.fn();
      const user = userEvent.setup();
      render(
        <PendingActivationPage
          recoveryLinks={recoveryLinks}
          errorState="error"
          errorTitle="Status unavailable"
          errorMessage="Try loading your status again."
          onRetry={onRetry}
          actions={actions}
        />,
      );
      expect(
        screen.getByRole("heading", { level: 2, name: "Status unavailable" }),
      ).toBeVisible();
      expect(screen.getByText("Try loading your status again.")).toBeVisible();
      const retry = screen.getByRole("button", { name: "Retry" });
      expect(screen.getAllByRole("button")).toEqual([retry]);
      expect(
        screen.queryByText(/req_8f2c41d07a9b|503|GET \/v1/),
      ).not.toBeInTheDocument();
      if (gesture === "click") await user.click(retry);
      else {
        retry.focus();
        await user.keyboard(gesture === "Enter" ? "{Enter}" : " ");
      }
      expect(onRetry).toHaveBeenCalledOnce();
    },
  );

  it.each([[[]], [actions]])(
    "shows busy skeletons and no controls while loading %j",
    (suppliedActions) => {
      render(
        <PendingActivationPage
          recoveryLinks={recoveryLinks}
          loading
          actions={suppliedActions}
        />,
      );
      const region = screen.getByRole("region", { name: "Available actions" });
      expect(region).toHaveAttribute("aria-busy", "true");
      expect(
        region.querySelectorAll('[aria-hidden="true"]').length,
      ).toBeGreaterThan(0);
      expect(within(region).queryByRole("button")).not.toBeInTheDocument();
      expect(within(region).queryByRole("link")).not.toBeInTheDocument();
      for (const placeholder of region.querySelectorAll(
        '[aria-hidden="true"]',
      )) {
        expect(placeholder).toHaveClass("motion-reduce:animate-none");
      }
    },
  );

  it("renders supplied links and buttons in order, calls buttons, and omits an empty region", async () => {
    onAction.mockClear();
    const user = userEvent.setup();
    const { rerender } = render(
      <PendingActivationPage recoveryLinks={recoveryLinks} actions={actions} />,
    );
    const region = screen.getByRole("region", { name: "Available actions" });
    expect(
      [...region.querySelectorAll("a,button")].map((node) => node.textContent),
    ).toEqual(["Review request", "Check status", "Account details"]);
    expect(
      within(region).getByRole("link", { name: "Review request" }),
    ).toHaveAttribute("href", "/requests/2048?from=pending");
    expect(
      within(region).getByRole("link", { name: "Account details" }),
    ).toHaveAttribute("href", "/account");
    await user.click(
      within(region).getByRole("button", { name: "Check status" }),
    );
    expect(onAction).toHaveBeenCalledOnce();
    rerender(
      <PendingActivationPage recoveryLinks={recoveryLinks} actions={[]} />,
    );
    expect(
      screen.queryByRole("region", { name: "Available actions" }),
    ).not.toBeInTheDocument();
  });

  it("shows an optional reference after status and removes it when absent", () => {
    const { rerender } = render(
      <PendingActivationPage
        recoveryLinks={recoveryLinks}
        reference={{ label: "Request received", value: "REQ-2048" }}
      />,
    );
    const reference = screen.getByRole("status", { name: "Request received" });
    expect(reference).toHaveAccessibleDescription("REQ-2048");
    expect(screen.getAllByRole("status")[1]).toBe(reference);
    rerender(<PendingActivationPage recoveryLinks={recoveryLinks} />);
    expect(
      screen.queryByRole("status", { name: "Request received" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("renders a meaningful default preview", () => {
    render(<PendingActivationPage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Your account is awaiting activation",
      }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });

  it.each(states)("keeps one consumer h1 and intro in %s", (_, state) => {
    render(
      <PendingActivationPage
        {...state}
        recoveryLinks={recoveryLinks}
        title="Awaiting review"
        intro="Your registration is complete."
      />,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Awaiting review",
    );
    expect(screen.getByText("Your registration is complete.")).toBeVisible();
  });

  it.each(["info", "warning", undefined] as const)(
    "announces status politely with tone %s",
    (statusTone) => {
      render(
        <PendingActivationPage
          recoveryLinks={recoveryLinks}
          statusTitle="Review pending"
          statusMessage="We will notify you after approval."
          statusTone={statusTone}
        />,
      );
      const status = screen.getByRole("status", { name: "Review pending" });
      expect(status).toHaveAccessibleDescription(
        "We will notify you after approval.",
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(within(status).queryByRole("button")).not.toBeInTheDocument();
      expect(status).toHaveClass(
        statusTone === "warning" ? "bg-warning/10" : "bg-info/10",
      );
      expectTypeOf<PendingActivationPageProps["statusTone"]>().toEqualTypeOf<
        "info" | "warning" | undefined
      >();
    },
  );
});
