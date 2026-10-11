# Plan definition card

Import `PlanDefinitionCard`, `PlanDefinition`, `PlanDefinitionStatus`, `PlanDefinitionCardProps` and `planDefinitionCardMeta` from `@gntik-ai/blocks`. This administrative presentation has no price, cycle, renewal or built-in upgrade action.

| Prop                     | Contract                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `plan`                   | `PlanDefinition`; omitted uses the neutral catalogue fixture                                         |
| `plan.name`, `plan.slug` | Required display name and identifier                                                                 |
| `plan.description`       | Optional description; absent means no description node                                               |
| `plan.status`            | Required draft/active/deprecated/archived; each has a distinct English label                         |
| `statusLabels`           | Optional partial status-to-label mapping supplied by the consumer                                    |
| `plan.capabilities`      | Optional `Record<string, boolean>`; labelled list entries show Enabled or Disabled                   |
| `plan.quotas`            | Optional `Record<string, string \| number>` rendered as key/value pairs in a `dl`; zero is preserved |
| `plan.tenantCount`       | Required assigned tenant count, including zero                                                       |
| `plan.updatedAt`         | Required Date or ISO string, formatted through billing `formatDate`                                  |
| `density`                | compact/full (default full); both show all supplied data                                             |
| `actions`                | Optional ReactNode slot of kit Buttons or native links                                               |
| `titleAs`                | h2/h3/h4, default h3                                                                                 |
| `className`              | Optional token-backed classes                                                                        |

ARIA: heading at the requested level; lifecycle badge uses visible text, never colour alone; capabilities are a named list; quotas, tenant count and update date use a description list. Actions retain their native button/link semantics. Dark, light and high_contrast axe coverage includes both densities and browser contrast checks.

| Key             | Behavior                         |
| --------------- | -------------------------------- |
| Tab / Shift+Tab | Focus consumer buttons and links |
| Enter           | Activate focused button or link  |
| Space           | Activate focused button          |

Preview IDs: `plan-definition-card--compact` and `plan-definition-card--full`. The examples show an Edit button and View tenants link. Consumers supply domain actions and override lifecycle labels as needed.
